#!/usr/bin/env python3
"""
Environment Setup Helper
Creates a .env file with placeholder values for testing
"""

import os
import sys

def create_env_file():
    """Create a .env file with placeholder values"""
    
    env_content = """# Cursor Blueprint Enforcer Environment Variables
# Replace these placeholder values with your actual credentials

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# BigQuery Configuration
BIGQUERY_PROJECT_ID=your-bigquery-project-id
BIGQUERY_DATASET_ID=your-dataset-id
BIGQUERY_TABLE_ID=your-table-id

# Neon Database Configuration
NEON_HOST=your-neon-host
NEON_DATABASE=your-neon-database
NEON_USER=your-neon-user
NEON_PASSWORD=your-neon-password
NEON_SSL=true

# Render Configuration
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id

# MindPal Configuration
MINDPAL_API_KEY=your-mindpal-api-key
MINDPAL_BASE_URL=https://api.mindpal.com

# DeerFlow Configuration
DEERFLOW_API_KEY=your-deerflow-api-key
DEERFLOW_BASE_URL=https://api.deerflow.com

# Make.com Configuration
MAKE_API_KEY=your-make-api-key
MAKE_BASE_URL=https://eu1.make.com/api/v2

# Google Workspace Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
GOOGLE_REFRESH_TOKEN=your-google-refresh-token

# Machine Sync Configuration
SYNC_BACKUP_DIR=./backups
SYNC_NOTIFICATION_WEBHOOK=your-webhook-url
SYNC_ENCRYPTION_KEY=your-encryption-key

# Development Configuration
NODE_ENV=development
LOG_LEVEL=info
"""
    
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ Created .env file with placeholder values")
        print("📝 Please edit .env file with your actual credentials")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        return False
    
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for placeholder values
        if 'your-' in content:
            print("⚠️  .env file contains placeholder values")
            print("📝 Please update with actual credentials")
            return False
        
        print("✅ .env file exists and appears to be configured")
        return True
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Cursor Blueprint Enforcer - Environment Setup")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        check_env_file()
    else:
        if os.path.exists('.env'):
            print("⚠️  .env file already exists")
            response = input("Do you want to overwrite it? (y/N): ")
            if response.lower() != 'y':
                print("Aborted")
                return
        
        create_env_file()

if __name__ == "__main__":
    main() 