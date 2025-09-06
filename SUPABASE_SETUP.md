# Supabase Setup Guide

This guide will help you set up Supabase for file uploads in the Orphion project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `orphion` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest region to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Once your project is created, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Create Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Click "Create a new bucket"
3. Enter bucket name: `game-images`
4. Make it **public** (uncheck "Private bucket")
5. Click "Create bucket"

## 4. Set Up Environment Variables

1. In your project root, create a `.env.local` file in `apps/web/`:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. Replace the values with your actual project credentials

## 5. Configure Storage Policies (REQUIRED)

**Important**: You must set up Row Level Security policies to allow file uploads.

### Option A: Quick Fix - Disable RLS
1. Go to Storage → Policies in your Supabase dashboard
2. Find your `game-images` bucket
3. **Disable Row Level Security** for this bucket

### Option B: Set Up RLS Policies (Recommended)
1. Go to your Supabase dashboard → SQL Editor
2. Run the SQL commands from `supabase-policies.sql` file
3. Or manually create these policies in Storage → Policies:

**Policy 1: Allow Public Read Access**
- Operation: `SELECT`
- Target: `public`
- Policy: `true`

**Policy 2: Allow Public Uploads**
- Operation: `INSERT` 
- Target: `public`
- Policy: `true`

**Policy 3: Allow Public Deletions**
- Operation: `DELETE`
- Target: `public`
- Policy: `true`

## 6. Test the Setup

1. Start your development server:
   ```bash
   bun dev
   ```

2. Go to the dashboard and try uploading an image
3. Check the browser console for any errors
4. Verify that images appear in your Supabase Storage dashboard

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env.local` file is in the correct location (`apps/web/.env.local`)
   - Restart your development server after adding environment variables

2. **"Upload failed" errors**
   - Check that your bucket is public
   - Verify your API keys are correct
   - Check the browser console for detailed error messages

3. **Images not displaying**
   - Ensure the bucket is public
   - Check that the uploaded URLs are accessible
   - Verify the image URLs in the browser console

### File Structure:
```
apps/web/
├── .env.local          # Your environment variables
├── src/
│   └── lib/
│       ├── supabase.ts      # Supabase client configuration
│       └── use-file-upload.ts # Upload hook with progress tracking
```

## Features Included:

- ✅ Automatic file upload to Supabase Storage
- ✅ Upload progress indicators
- ✅ Success/error status indicators
- ✅ Automatic cleanup when images are removed
- ✅ Support for both camera capture and gallery uploads
- ✅ Public URL generation for uploaded images

Your images will be stored in the `game-images` bucket and accessible via public URLs that you can use in your game logic.
