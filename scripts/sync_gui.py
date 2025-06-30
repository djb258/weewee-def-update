#!/usr/bin/env python3
"""
Cursor Blueprint Enforcer - GUI Sync Tool
A simple GUI application to sync Cursor configuration and tools across machines.
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import threading
import os
import sys
import json
from datetime import datetime

class CursorSyncGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Cursor Blueprint Enforcer - Sync Tool")
        self.root.geometry("600x500")
        self.root.resizable(True, True)
        
        # Set icon if available
        try:
            self.root.iconbitmap("icon.ico")
        except:
            pass
        
        self.setup_ui()
        self.sync_in_progress = False
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(3, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="🚀 Cursor Blueprint Enforcer", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # Status
        self.status_label = ttk.Label(main_frame, text="Ready to sync", 
                                     font=("Arial", 10))
        self.status_label.grid(row=1, column=0, columnspan=2, pady=(0, 20))
        
        # Buttons frame
        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=2, column=0, columnspan=2, pady=(0, 20))
        
        # Sync Cursor button
        self.sync_cursor_btn = ttk.Button(buttons_frame, text="🔄 Sync Cursor Config", 
                                         command=self.sync_cursor, width=20)
        self.sync_cursor_btn.grid(row=0, column=0, padx=(0, 10))
        
        # Sync Everything button
        self.sync_all_btn = ttk.Button(buttons_frame, text="🚀 Sync Everything", 
                                      command=self.sync_everything, width=20)
        self.sync_all_btn.grid(row=0, column=1, padx=(0, 10))
        
        # Export button
        self.export_btn = ttk.Button(buttons_frame, text="📤 Export Config", 
                                    command=self.export_config, width=20)
        self.export_btn.grid(row=0, column=2)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Log area
        log_frame = ttk.LabelFrame(main_frame, text="Sync Log", padding="5")
        log_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=15, width=70)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Bottom buttons
        bottom_frame = ttk.Frame(main_frame)
        bottom_frame.grid(row=5, column=0, columnspan=2, pady=(10, 0))
        
        # Test button
        self.test_btn = ttk.Button(bottom_frame, text="🧪 Test Integrations", 
                                  command=self.test_integrations, width=15)
        self.test_btn.grid(row=0, column=0, padx=(0, 10))
        
        # Generate Summary button
        self.summary_btn = ttk.Button(bottom_frame, text="📊 Generate Summary", 
                                     command=self.generate_summary, width=15)
        self.summary_btn.grid(row=0, column=1, padx=(0, 10))
        
        # Exit button
        self.exit_btn = ttk.Button(bottom_frame, text="❌ Exit", 
                                  command=self.root.quit, width=15)
        self.exit_btn.grid(row=0, column=2)
        
        # Initial log message
        self.log("Cursor Blueprint Enforcer GUI started")
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
            result = subprocess.run(command, shell=True, capture_output=True, 
                                  text=True, timeout=300)
            
            if result.stdout:
                self.log(f"Output: {result.stdout.strip()}")
            if result.stderr:
                self.log(f"Error: {result.stderr.strip()}")
                
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
            
    def sync_cursor(self):
        """Sync Cursor configuration"""
        if self.sync_in_progress:
            messagebox.showwarning("Sync in Progress", "Please wait for current sync to complete.")
            return
            
        self.sync_in_progress = True
        self.sync_cursor_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Syncing Cursor configuration...")
        
        def sync_thread():
            try:
                # Check if cursor-config exists
                if os.path.exists("cursor-config"):
                    success = self.run_command("npm run sync-cursor import", "Import Cursor configuration")
                else:
                    success = self.run_command("npm run sync-cursor export", "Export Cursor configuration")
                
                if success:
                    messagebox.showinfo("Success", "Cursor configuration synced successfully!")
                else:
                    messagebox.showerror("Error", "Failed to sync Cursor configuration. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.sync_cursor_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready to sync")
                
        threading.Thread(target=sync_thread, daemon=True).start()
        
    def sync_everything(self):
        """Sync everything (Cursor + Tools + Machine config)"""
        if self.sync_in_progress:
            messagebox.showwarning("Sync in Progress", "Please wait for current sync to complete.")
            return
            
        self.sync_in_progress = True
        self.sync_all_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Syncing everything...")
        
        def sync_thread():
            try:
                success = True
                
                # Sync Cursor
                if os.path.exists("cursor-config"):
                    success &= self.run_command("npm run sync-cursor import", "Import Cursor configuration")
                else:
                    success &= self.run_command("npm run sync-cursor export", "Export Cursor configuration")
                
                # Sync machine configuration
                if os.path.exists("machine-sync-config.json"):
                    success &= self.run_command("npm run sync-machines", "Sync machine configuration")
                
                # Sync tool configuration
                if os.path.exists("tool-sync-config.json"):
                    success &= self.run_command("npm run sync-tools", "Sync tool configuration")
                
                # Generate summary
                success &= self.run_command("npm run generate-summary", "Generate project summary")
                
                if success:
                    messagebox.showinfo("Success", "Everything synced successfully!")
                else:
                    messagebox.showerror("Error", "Some sync operations failed. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.sync_all_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready to sync")
                
        threading.Thread(target=sync_thread, daemon=True).start()
        
    def export_config(self):
        """Export current configuration"""
        if self.sync_in_progress:
            messagebox.showwarning("Sync in Progress", "Please wait for current sync to complete.")
            return
            
        self.sync_in_progress = True
        self.export_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Exporting configuration...")
        
        def export_thread():
            try:
                success = True
                
                # Export Cursor configuration
                success &= self.run_command("npm run sync-cursor export", "Export Cursor configuration")
                
                # Generate machine sync config if it doesn't exist
                if not os.path.exists("machine-sync-config.json"):
                    success &= self.run_command("npm run sync-machines", "Generate machine sync configuration")
                
                # Generate tool sync config if it doesn't exist
                if not os.path.exists("tool-sync-config.json"):
                    success &= self.run_command("npm run sync-tools", "Generate tool sync configuration")
                
                # Generate summary
                success &= self.run_command("npm run generate-summary", "Generate project summary")
                
                if success:
                    messagebox.showinfo("Success", "Configuration exported successfully!")
                else:
                    messagebox.showerror("Error", "Some export operations failed. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.export_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready to sync")
                
        threading.Thread(target=export_thread, daemon=True).start()
        
    def test_integrations(self):
        """Test all integrations"""
        if self.sync_in_progress:
            messagebox.showwarning("Sync in Progress", "Please wait for current sync to complete.")
            return
            
        self.sync_in_progress = True
        self.test_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Testing integrations...")
        
        def test_thread():
            try:
                integrations = [
                    ("Google Workspace", "npm run google:health"),
                    ("MindPal", "npm run mindpal:health"),
                    ("DeerFlow", "npm run deerflow:health"),
                    ("Render", "npm run render:health"),
                    ("Make.com", "npm run make:health"),
                ]
                
                results = []
                for name, command in integrations:
                    self.log(f"Testing {name}...")
                    success = self.run_command(command, f"Test {name}")
                    results.append((name, success))
                
                # Show results
                failed = [name for name, success in results if not success]
                if failed:
                    messagebox.showwarning("Test Results", 
                                         f"Some integrations failed:\n{', '.join(failed)}\n\nCheck the log for details.")
                else:
                    messagebox.showinfo("Test Results", "All integrations working correctly!")
                    
            finally:
                self.sync_in_progress = False
                self.test_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready to sync")
                
        threading.Thread(target=test_thread, daemon=True).start()
        
    def generate_summary(self):
        """Generate project summary"""
        if self.sync_in_progress:
            messagebox.showwarning("Sync in Progress", "Please wait for current sync to complete.")
            return
            
        self.sync_in_progress = True
        self.summary_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Generating summary...")
        
        def summary_thread():
            try:
                success = self.run_command("npm run generate-summary", "Generate project summary")
                
                if success:
                    messagebox.showinfo("Success", "Project summary generated successfully!")
                else:
                    messagebox.showerror("Error", "Failed to generate summary. Check the log for details.")
                    
            finally:
                self.sync_in_progress = False
                self.summary_btn.config(state='normal')
                self.progress.stop()
                self.status_label.config(text="Ready to sync")
                
        threading.Thread(target=summary_thread, daemon=True).start()

def main():
    """Main function"""
    # Check if we're in the right directory
    if not os.path.exists("package.json"):
        messagebox.showerror("Error", "Please run this script from the cursor-blueprint-enforcer directory.")
        return
    
    # Create and run GUI
    root = tk.Tk()
    app = CursorSyncGUI(root)
    
    # Center the window
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - (root.winfo_width() // 2)
    y = (root.winfo_screenheight() // 2) - (root.winfo_height() // 2)
    root.geometry(f"+{x}+{y}")
    
    root.mainloop()

if __name__ == "__main__":
    main() 