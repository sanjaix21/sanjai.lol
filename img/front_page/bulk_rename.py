#!/bin/python3
import os
import sys

def bulk_rename(folder_path, prefix="image"):
    # List all files in the directory
    files = os.listdir(folder_path)
    
    # Filter out only files (not directories)
    files = [f for f in files if os.path.isfile(os.path.join(folder_path, f))]
    
    # Sort files to ensure consistent ordering
    files.sort()
    
    # Rename each file
    for index, file_name in enumerate(files):
        # Create new file name
        new_file_name = f"{prefix}_{index + 1}.jpg"
        
        # Full paths
        old_file_path = os.path.join(folder_path, file_name)
        new_file_path = os.path.join(folder_path, new_file_name)
        
        # Rename the file
        os.rename(old_file_path, new_file_path)
        print(f"Renamed: {old_file_path} to {new_file_path}")

# Example usage
folder_path = sys.argv[1]
bulk_rename(folder_path)

