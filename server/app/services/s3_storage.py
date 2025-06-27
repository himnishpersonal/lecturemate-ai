import boto3
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import UploadFile
from botocore.exceptions import ClientError, NoCredentialsError
import os
from dotenv import load_dotenv

load_dotenv()

class S3StorageService:
    def __init__(self, bucket_name: str = None):
        self.bucket_name = bucket_name or os.getenv('S3_BUCKET_NAME', 'lecturemate-ai')
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
    def _generate_lecture_id(self) -> str:
        """Generate a unique lecture ID"""
        return f"lecture_{uuid.uuid4().hex[:8]}"
    
    def _get_transcript_key(self, user_id: str, folder_name: str, lecture_id: str) -> str:
        """Generate S3 key for transcript file"""
        return f"users/{user_id}/{folder_name}/{lecture_id}/transcript.json"
    
    def _get_notes_key(self, user_id: str, folder_name: str, lecture_id: str) -> str:
        """Generate S3 key for notes file"""
        return f"users/{user_id}/{folder_name}/{lecture_id}/notes.json"
    
    def _get_folder_metadata_key(self, user_id: str, folder_name: str) -> str:
        """Generate S3 key for folder metadata"""
        return f"users/{user_id}/{folder_name}/metadata.json"
    
    async def create_lecture(self, user_id: str, folder_name: str, title: str, description: str = None) -> str:
        """Create a new lecture and return the lecture ID"""
        lecture_id = self._generate_lecture_id()
        
        # Create initial transcript data
        transcript_data = {
            "lecture_id": lecture_id,
            "title": title,
            "description": description,
            "transcript": "",
            "duration": 0,
            "word_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Create initial notes data
        notes_data = {
            "lecture_id": lecture_id,
            "title": title,
            "description": description,
            "notes": "",
            "summary": "",
            "key_points": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            # Upload initial transcript
            transcript_key = self._get_transcript_key(user_id, folder_name, lecture_id)
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=transcript_key,
                Body=json.dumps(transcript_data, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
            # Upload initial notes
            notes_key = self._get_notes_key(user_id, folder_name, lecture_id)
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=notes_key,
                Body=json.dumps(notes_data, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
            # Update folder metadata
            await self._update_folder_metadata(user_id, folder_name, lecture_id, title)
            
            return lecture_id
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error creating lecture in S3: {str(e)}")
    
    async def update_transcript(self, user_id: str, folder_name: str, lecture_id: str, transcript: str, duration: int = 0) -> None:
        """Update the transcript for a lecture"""
        try:
            # Get existing transcript data
            transcript_key = self._get_transcript_key(user_id, folder_name, lecture_id)
            existing_data = await self._get_file_content(transcript_key)
            
            # Update transcript data
            existing_data.update({
                "transcript": transcript,
                "duration": duration,
                "word_count": len(transcript.split()),
                "updated_at": datetime.now().isoformat()
            })
            
            # Upload updated transcript
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=transcript_key,
                Body=json.dumps(existing_data, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error updating transcript in S3: {str(e)}")
    
    async def update_notes(self, user_id: str, folder_name: str, lecture_id: str, notes: str, summary: str = "", key_points: List[str] = None) -> None:
        """Update the notes for a lecture"""
        try:
            # Get existing notes data
            notes_key = self._get_notes_key(user_id, folder_name, lecture_id)
            existing_data = await self._get_file_content(notes_key)
            
            # Update notes data
            existing_data.update({
                "notes": notes,
                "summary": summary,
                "key_points": key_points or [],
                "updated_at": datetime.now().isoformat()
            })
            
            # Upload updated notes
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=notes_key,
                Body=json.dumps(existing_data, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error updating notes in S3: {str(e)}")
    
    async def get_transcript(self, user_id: str, folder_name: str, lecture_id: str) -> Dict[str, Any]:
        """Get transcript data for a lecture"""
        transcript_key = self._get_transcript_key(user_id, folder_name, lecture_id)
        return await self._get_file_content(transcript_key)
    
    async def get_notes(self, user_id: str, folder_name: str, lecture_id: str) -> Dict[str, Any]:
        """Get notes data for a lecture"""
        notes_key = self._get_notes_key(user_id, folder_name, lecture_id)
        return await self._get_file_content(notes_key)
    
    async def get_lecture(self, user_id: str, folder_name: str, lecture_id: str) -> Dict[str, Any]:
        """Get both transcript and notes for a lecture"""
        try:
            transcript = await self.get_transcript(user_id, folder_name, lecture_id)
            notes = await self.get_notes(user_id, folder_name, lecture_id)
            
            return {
                "lecture_id": lecture_id,
                "title": transcript.get("title", ""),
                "description": transcript.get("description", ""),
                "transcript": transcript.get("transcript", ""),
                "notes": notes.get("notes", ""),
                "summary": notes.get("summary", ""),
                "key_points": notes.get("key_points", []),
                "duration": transcript.get("duration", 0),
                "word_count": transcript.get("word_count", 0),
                "created_at": transcript.get("created_at"),
                "updated_at": transcript.get("updated_at")
            }
            
        except Exception as e:
            raise Exception(f"Error getting lecture data: {str(e)}")
    
    async def list_lectures_in_folder(self, user_id: str, folder_name: str) -> List[Dict[str, Any]]:
        """List all lectures in a folder"""
        try:
            prefix = f"users/{user_id}/{folder_name}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                Delimiter='/'
            )
            
            lectures = []
            for obj in response.get('Contents', []):
                key = obj['Key']
                if key.endswith('/transcript.json'):
                    # Extract lecture_id from path
                    parts = key.split('/')
                    if len(parts) >= 4:
                        lecture_id = parts[-2]  # The directory name before transcript.json
                        try:
                            transcript_data = await self.get_transcript(user_id, folder_name, lecture_id)
                            lectures.append({
                                "lecture_id": lecture_id,
                                "title": transcript_data.get("title", ""),
                                "description": transcript_data.get("description", ""),
                                "duration": transcript_data.get("duration", 0),
                                "created_at": transcript_data.get("created_at"),
                                "updated_at": transcript_data.get("updated_at")
                            })
                        except Exception:
                            # Skip lectures with corrupted data
                            continue
            
            return lectures
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error listing lectures: {str(e)}")
    
    async def delete_lecture(self, user_id: str, folder_name: str, lecture_id: str) -> None:
        """Delete a lecture and all its associated files"""
        try:
            # Delete transcript
            transcript_key = self._get_transcript_key(user_id, folder_name, lecture_id)
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=transcript_key)
            
            # Delete notes
            notes_key = self._get_notes_key(user_id, folder_name, lecture_id)
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=notes_key)
            
            # Update folder metadata
            await self._remove_lecture_from_folder_metadata(user_id, folder_name, lecture_id)
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error deleting lecture from S3: {str(e)}")
    
    async def _get_file_content(self, key: str) -> Dict[str, Any]:
        """Get JSON content from S3 object"""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            content = response['Body'].read().decode('utf-8')
            return json.loads(content)
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error reading file from S3: {str(e)}")
    
    async def _update_folder_metadata(self, user_id: str, folder_name: str, lecture_id: str, title: str) -> None:
        """Update folder metadata when adding a new lecture"""
        try:
            metadata_key = self._get_folder_metadata_key(user_id, folder_name)
            
            # Try to get existing metadata
            try:
                existing_metadata = await self._get_file_content(metadata_key)
            except:
                # Create new metadata if it doesn't exist
                existing_metadata = {
                    "folder_id": folder_name,
                    "folder_name": folder_name,
                    "lecture_count": 0,
                    "total_duration": 0,
                    "last_updated": datetime.now().isoformat(),
                    "lectures": []
                }
            
            # Add new lecture to metadata
            existing_metadata["lectures"].append({
                "lecture_id": lecture_id,
                "title": title,
                "duration": 0,
                "created_at": datetime.now().isoformat()
            })
            
            existing_metadata["lecture_count"] = len(existing_metadata["lectures"])
            existing_metadata["last_updated"] = datetime.now().isoformat()
            
            # Upload updated metadata
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=metadata_key,
                Body=json.dumps(existing_metadata, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error updating folder metadata: {str(e)}")
    
    async def _remove_lecture_from_folder_metadata(self, user_id: str, folder_name: str, lecture_id: str) -> None:
        """Remove a lecture from folder metadata when deleting"""
        try:
            metadata_key = self._get_folder_metadata_key(user_id, folder_name)
            
            # Get existing metadata
            existing_metadata = await self._get_file_content(metadata_key)
            
            # Remove lecture from list
            existing_metadata["lectures"] = [
                lecture for lecture in existing_metadata["lectures"] 
                if lecture["lecture_id"] != lecture_id
            ]
            
            existing_metadata["lecture_count"] = len(existing_metadata["lectures"])
            existing_metadata["last_updated"] = datetime.now().isoformat()
            
            # Upload updated metadata
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=metadata_key,
                Body=json.dumps(existing_metadata, indent=2),
                ContentType='application/json',
                ServerSideEncryption='AES256'
            )
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error updating folder metadata: {str(e)}")
    
    async def get_folder_metadata(self, user_id: str, folder_name: str) -> Dict[str, Any]:
        """Get metadata for a folder"""
        metadata_key = self._get_folder_metadata_key(user_id, folder_name)
        return await self._get_file_content(metadata_key)
    
    async def list_user_folders(self, user_id: str) -> List[str]:
        """List all folders for a user"""
        try:
            prefix = f"users/{user_id}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                Delimiter='/'
            )
            
            folders = []
            for prefix_info in response.get('CommonPrefixes', []):
                folder_path = prefix_info['Prefix']
                # Extract folder name from path
                folder_name = folder_path.rstrip('/').split('/')[-1]
                folders.append(folder_name)
            
            return folders
            
        except (ClientError, NoCredentialsError) as e:
            raise Exception(f"Error listing user folders: {str(e)}")

# Initialize the S3 storage service
s3_storage_service = S3StorageService() 