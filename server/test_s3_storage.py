#!/usr/bin/env python3
"""
Test script for S3 Storage Service
Run this to verify your S3 setup is working correctly
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.s3_storage import S3StorageService

load_dotenv()

async def test_s3_storage():
    """Test the S3 storage service functionality"""
    
    # Check if AWS credentials are set
    if not os.getenv('AWS_ACCESS_KEY_ID') or not os.getenv('AWS_SECRET_ACCESS_KEY'):
        print("❌ AWS credentials not found in environment variables")
        print("Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
        return
    
    print("🔧 Testing S3 Storage Service...")
    
    # Initialize S3 storage service
    s3_service = S3StorageService()
    
    # Test data
    test_user_id = "test_user_123"
    test_folder_name = "Test Computer Science"
    test_title = "Introduction to Algorithms"
    test_description = "Basic algorithm concepts and complexity analysis"
    
    try:
        print(f"📁 Creating test lecture in folder: {test_folder_name}")
        
        # Test 1: Create a new lecture
        lecture_id = await s3_service.create_lecture(
            user_id=test_user_id,
            folder_name=test_folder_name,
            title=test_title,
            description=test_description
        )
        print(f"✅ Created lecture with ID: {lecture_id}")
        
        # Test 2: Update transcript
        test_transcript = """
        Welcome to Introduction to Algorithms. Today we'll be covering fundamental concepts 
        that are essential for understanding how algorithms work and how to analyze their efficiency.
        
        We'll start with the basics of algorithm complexity, then move on to Big O notation, 
        and finally discuss some common algorithms like sorting and searching.
        """
        
        await s3_service.update_transcript(
            user_id=test_user_id,
            folder_name=test_folder_name,
            lecture_id=lecture_id,
            transcript=test_transcript,
            duration=3600  # 1 hour in seconds
        )
        print("✅ Updated transcript")
        
        # Test 3: Update notes
        test_notes = """
# Introduction to Algorithms

## Key Concepts
- **Algorithm Efficiency**: How fast an algorithm runs
- **Big O Notation**: Mathematical notation for algorithm complexity
- **Time Complexity**: How runtime grows with input size

## Examples Covered
1. Linear Search - O(n)
2. Binary Search - O(log n)
3. Bubble Sort - O(n²)

## Key Takeaways
- Always consider worst-case scenarios
- Big O notation helps compare algorithms
- Efficiency matters for large datasets
        """
        
        await s3_service.update_notes(
            user_id=test_user_id,
            folder_name=test_folder_name,
            lecture_id=lecture_id,
            notes=test_notes,
            summary="Overview of fundamental algorithm concepts and complexity analysis",
            key_points=["efficiency", "complexity", "Big O notation", "sorting", "searching"]
        )
        print("✅ Updated notes")
        
        # Test 4: Get lecture data
        lecture_data = await s3_service.get_lecture(
            user_id=test_user_id,
            folder_name=test_folder_name,
            lecture_id=lecture_id
        )
        print(f"✅ Retrieved lecture data: {lecture_data['title']}")
        print(f"   Duration: {lecture_data['duration']} seconds")
        print(f"   Word count: {lecture_data['word_count']} words")
        
        # Test 5: List lectures in folder
        lectures = await s3_service.list_lectures_in_folder(
            user_id=test_user_id,
            folder_name=test_folder_name
        )
        print(f"✅ Found {len(lectures)} lectures in folder")
        
        # Test 6: Get folder metadata
        folder_metadata = await s3_service.get_folder_metadata(
            user_id=test_user_id,
            folder_name=test_folder_name
        )
        print(f"✅ Folder metadata: {folder_metadata['lecture_count']} lectures")
        
        # Test 7: List user folders
        folders = await s3_service.list_user_folders(test_user_id)
        print(f"✅ User has {len(folders)} folders: {folders}")
        
        # Test 8: Clean up - delete the test lecture
        await s3_service.delete_lecture(
            user_id=test_user_id,
            folder_name=test_folder_name,
            lecture_id=lecture_id
        )
        print("✅ Deleted test lecture")
        
        print("\n🎉 All S3 storage tests passed!")
        print("Your S3 setup is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Check your AWS credentials are correct")
        print("2. Verify your S3 bucket exists and is accessible")
        print("3. Ensure your IAM user has the necessary S3 permissions")
        print("4. Check your AWS region is correct")

if __name__ == "__main__":
    asyncio.run(test_s3_storage()) 