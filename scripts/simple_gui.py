#!/usr/bin/env python3
"""
Simple Cursor Blueprint Enforcer GUI
A simplified GUI that focuses on working functionality
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import threading
import os
import sys
from datetime import datetime

class SimpleCursorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Cursor Blueprint Enforcer - Simple GUI")
        self.root.geometry("500x400")
        self.root.resizable(True, True)
        
        self.setup_ui()
        self.sync_in_progress = False
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="🚀 Cursor Blueprint Enforcer", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, pady=(0, 20))
        
        # Status
        self.status_label = ttk.Label(main_frame, text="Ready", 
                                     font=("Arial", 10))
        self.status_label.grid(row=1, column=0, pady=(0, 20))
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=2, column=0, pady=(0, 20))
        
        # Core buttons
        self.export_btn = ttk.Button(buttons_frame, text="📤 Export Cursor Config", 
                                    command=self.export_cursor, width=25)
        self.export_btn.grid(row=0, column=0, padx=(0, 10), pady=(0, 10))
        
        self.import_btn = ttk.Button(buttons_frame, text="📥 Import Cursor Config", 
                                    command=self.import_cursor, width=25)
        self.import_btn.grid(row=0, column=1, padx=(0, 10), pady=(0, 10))
        
        self.summary_btn = ttk.Button(buttons_frame, text="📊 Generate Summary", 
                                     command=self.generate_summary, width=25)
        self.summary_btn.grid(row=1, column=0, padx=(0, 10), pady=(0, 10))
        
        self.test_btn = ttk.Button(buttons_frame, text="🧪 Run Tests", 
                                  command=self.run_tests, width=25)
        self.test_btn.grid(row=1, column=1, padx=(0, 10), pady=(0, 10))
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=3, column=0, sticky="ew", pady=(0, 10))
        
        # Log area
        log_frame = ttk.LabelFrame(main_frame, text="Output Log", padding="5")
        log_frame.grid(row=4, column=0, sticky="nsew")
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=12, width=60)
        self.log_text.grid(row=0, column=0, sticky="nsew")
        
        # Exit button
        self.exit_btn = ttk.Button(main_frame, text="❌ Exit", 
                                  command=self.root.quit, width=15)
        self.exit_btn.grid(row=5, column=0, pady=(10, 0))
        
        # Initial log message
        self.log("Simple Cursor Blueprint Enforcer GUI started")
        self.log(f"Current directory: {os.getcwd()}")
        
    def log(self, message):
        """Add message to log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
        
    def run_command(self, command, description):
        """Run a command and log the output"""
        self.log(f"Running: {description}")
        try:
            # Use UTF-8 encoding and handle encoding errors gracefully
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                encoding='utf-8', 
                errors='replace', 
                timeout=60
            )
            
            if result.stdout:
                output = result.stdout.strip()
                if output:
                    self.log(f"Output: {output}")
            if result.stderr:
                error = result.stderr.strip()
                if error:
                    self.log(f"Error: {error}")
                
            if result.returncode == 0:
                self.log(f"✅ {description} completed successfully")
                return True
            else:
                self.log(f"❌ {description} failed with code {result.returncode}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log(f"⏰ {description} timed out")
            return False
        except Exception as e:
            self.log(f"💥 {description} failed: {str(e)}")
            return False
            
    def export_cursor(self):
        """Export Cursor configuration"""
        if self.sync_in_progress:
            messagebox.showwarning("Operation in Progress", "Please wait for current operation to complete.")
            return
            
        self.sync_in_progress = True
        self.export_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Exporting Cursor configuration...")
        
        def export_thread():
            try:
                success = self.run_command("npm run sync-cursor export", "Export Cursor configuration")
                
                if success:
                    messagebox.showinfo("Success", "Cursor configuration exported successfully!")
                else:
                    messagebox.showerror("Error", "Failed to export Cursor configuration. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.export_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready")
                
        threading.Thread(target=export_thread, daemon=True).start()
        
    def import_cursor(self):
        """Import Cursor configuration"""
        if self.sync_in_progress:
            messagebox.showwarning("Operation in Progress", "Please wait for current operation to complete.")
            return
            
        self.sync_in_progress = True
        self.import_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Importing Cursor configuration...")
        
        def import_thread():
            try:
                success = self.run_command("npm run sync-cursor import", "Import Cursor configuration")
                
                if success:
                    messagebox.showinfo("Success", "Cursor configuration imported successfully!")
                else:
                    messagebox.showerror("Error", "Failed to import Cursor configuration. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.import_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready")
                
        threading.Thread(target=import_thread, daemon=True).start()
        
    def generate_summary(self):
        """Generate project summary"""
        if self.sync_in_progress:
            messagebox.showwarning("Operation in Progress", "Please wait for current operation to complete.")
            return
            
        self.sync_in_progress = True
        self.summary_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Generating project summary...")
        
        def summary_thread():
            try:
                success = self.run_command("npm run generate-summary", "Generate project summary")
                
                if success:
                    messagebox.showinfo("Success", "Project summary generated successfully!")
                else:
                    messagebox.showerror("Error", "Failed to generate project summary. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.summary_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready")
                
        threading.Thread(target=summary_thread, daemon=True).start()
        
    def run_tests(self):
        """Run project tests"""
        if self.sync_in_progress:
            messagebox.showwarning("Operation in Progress", "Please wait for current operation to complete.")
            return
            
        self.sync_in_progress = True
        self.test_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Running tests...")
        
        def test_thread():
            try:
                success = self.run_command("npm test", "Run project tests")
                
                if success:
                    messagebox.showinfo("Success", "Tests completed successfully!")
                else:
                    messagebox.showerror("Error", "Some tests failed. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.test_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready")
                
        threading.Thread(target=test_thread, daemon=True).start()

def main():
    """Main function to start the GUI"""
    try:
        root = tk.Tk()
        app = SimpleCursorGUI(root)
        
        # Center the window
        root.update_idletasks()
        x = (root.winfo_screenwidth() // 2) - (root.winfo_width() // 2)
        y = (root.winfo_screenheight() // 2) - (root.winfo_height() // 2)
        root.geometry(f"+{x}+{y}")
        
        # Start the GUI
        root.mainloop()
        
    except Exception as e:
        print(f"Failed to start GUI: {e}")
        print("Falling back to command line interface...")
        print("Available commands:")
        print("  npm run sync-cursor export")
        print("  npm run sync-cursor import") 
        print("  npm run generate-summary")
        print("  npm test")

if __name__ == "__main__":
    main() 