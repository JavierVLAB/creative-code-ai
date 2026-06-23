## REMOVED Requirements

### Requirement: File System Access API
**Reason**: Persistence is now handled by Supabase. The app no longer opens local folders or reads/writes local files.
**Migration**: 
- Projects are created, stored, and retrieved from Supabase
- The "Open folder" button is replaced with "New project" / "My library"
- The file explorer now shows files from the project record in Supabase
- Drag & drop fallback for unsupported browsers is removed

### Requirement: Local file handles
**Reason**: No file handles are needed since all data lives in Supabase.
**Migration**: The `fileSystem.ts` module is replaced by Supabase client calls.
