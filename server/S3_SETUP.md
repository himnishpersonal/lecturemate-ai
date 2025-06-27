# S3 Storage Service Setup Guide

This guide will help you set up AWS S3 storage for your LectureMate application.

## Prerequisites

1. AWS Account with S3 access
2. IAM user with S3 permissions (already configured)
3. S3 bucket created (already configured)
4. Python environment with required packages

## Environment Variables Setup

Create a `.env` file in the `server/` directory with the following variables:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=lecturemate-ai

# Other configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## S3 Directory Structure

The S3 storage follows this structure:

```
lecturemate-ai-bucket/
├── users/
│   ├── user_123/
│   │   ├── Computer Science/
│   │   │   ├── lecture_001/
│   │   │   │   ├── transcript.json
│   │   │   │   └── notes.json
│   │   │   └── metadata.json
│   │   └── Mathematics/
│   │       ├── lecture_002/
│   │       │   ├── transcript.json
│   │       │   └── notes.json
│   │       └── metadata.json
```

## Testing the Setup

1. **Set up environment variables** (see above)

2. **Run the test script**:

   ```bash
   cd server
   python test_s3_storage.py
   ```

3. **Expected output**:

   ```
   🔧 Testing S3 Storage Service...
   📁 Creating test lecture in folder: Test Computer Science
   ✅ Created lecture with ID: lecture_abc12345
   ✅ Updated transcript
   ✅ Updated notes
   ✅ Retrieved lecture data: Introduction to Algorithms
   ✅ Found 1 lectures in folder
   ✅ Folder metadata: 1 lectures
   ✅ User has 1 folders: ['Test Computer Science']
   ✅ Deleted test lecture

   🎉 All S3 storage tests passed!
   Your S3 setup is working correctly.
   ```

## Troubleshooting

### Common Issues

1. **"AWS credentials not found"**

   - Check your `.env` file exists and has correct credentials
   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set

2. **"Access Denied" errors**

   - Verify your IAM user has the necessary S3 permissions
   - Check bucket name is correct
   - Ensure bucket exists in the specified region

3. **"No such file or directory"**

   - Make sure you're running the test from the `server/` directory
   - Check that `app/services/s3_storage.py` exists

4. **"Bucket does not exist"**
   - Verify the S3 bucket name in your `.env` file
   - Check the bucket exists in your AWS account

### IAM Permissions Required

Your IAM user needs these S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::lecturemate-ai",
        "arn:aws:s3:::lecturemate-ai/*"
      ]
    }
  ]
}
```

## Next Steps

After successful testing:

1. **Update your API endpoints** to use the new S3 storage service
2. **Replace the old storage service** in your existing code
3. **Test with real data** from your application
4. **Monitor S3 usage** and costs

## File Structure

- `app/services/s3_storage.py` - Main S3 storage service
- `test_s3_storage.py` - Test script to verify setup
- `S3_SETUP.md` - This setup guide

## Security Notes

- Never commit your `.env` file to version control
- Use IAM roles instead of hardcoded credentials in production
- Enable S3 bucket encryption
- Set up proper bucket policies for access control
