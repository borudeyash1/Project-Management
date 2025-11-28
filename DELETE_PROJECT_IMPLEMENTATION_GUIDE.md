# DELETE PROJECT FUNCTIONALITY - IMPLEMENTATION GUIDE

## File: client/src/components/workspace/WorkspaceProjects.tsx

### STEP 1: Add State Variables (after line 35)

Add these 4 new state variables:

```typescript
const [showCreateModal, setShowCreateModal] = useState(false);
// ADD THESE 4 LINES BELOW ↓
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [projectToDelete, setProjectToDelete] = useState<any>(null);
const [deleteConfirmText, setDeleteConfirmText] = useState('');
const [openDropdown, setOpenDropdown] = useState<string | null>(null);
```

---

### STEP 2: Add X Icon Import (line 24)

Change:
```typescript
  Archive
} from 'lucide-react';
```

To:
```typescript
  Archive,
  X
} from 'lucide-react';
```

---

### STEP 3: Add Delete Handlers (after line 87, before `const stats = [`)

Add these two functions:

```typescript
const handleDeleteProject = (project: any) => {
  setProjectToDelete(project);
  setDeleteConfirmText('');
  setShowDeleteModal(true);
  setOpenDropdown(null);
};

const handleConfirmDelete = async () => {
  if (deleteConfirmText.toUpperCase() !== 'DELETE') {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: 'Please type DELETE to confirm',
      },
    });
    return;
  }

  if (!projectToDelete) return;

  try {
    const response = await fetch(`/api/projects/${projectToDelete._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete project');
    }
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Project deleted successfully',
      },
    });
    
    setShowDeleteModal(false);
    setProjectToDelete(null);
    setDeleteConfirmText('');
    
    window.location.reload();
  } catch (error: any) {
    console.error('Failed to delete project', error);
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to delete project',
      },
    });
  }
};
```

---

### STEP 4: Replace Three-Dot Button in GRID VIEW (around line 196-205)

Find this code:
```typescript
{isOwner && (
  <button
    onClick={(e) => {
      e.stopPropagation();
    }}
    className="text-gray-600 hover:text-gray-600 dark:hover:text-gray-700"
  >
    <MoreVertical className="w-4 h-4" />
  </button>
)}
```

Replace with:
```typescript
{isOwner && (
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenDropdown(openDropdown === project._id ? null : project._id);
      }}
      className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-300"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
    {openDropdown === project._id && (
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/project/${project._id}`);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Project
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteProject(project);
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </button>
      </div>
    )}
  </div>
)}
```

---

### STEP 5: Replace Three-Dot Button in LIST VIEW (around line 341-350)

Find the SECOND occurrence of the same three-dot button code (in the table view), and replace it with the same dropdown code as above.

---

### STEP 6: Add Delete Modal (before the last `</div>` and `export default`, around line 438)

Add this modal code just before `</div>` that closes the main component:

```typescript
{/* Delete Project Confirmation Modal */}
{showDeleteModal && projectToDelete && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Project</h3>
        <button onClick={() => setShowDeleteModal(false)}>
          <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
        </button>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You are about to permanently delete "{projectToDelete.name}". This action cannot be undone.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-400 font-medium">⚠️ Warning:</p>
          <ul className="text-sm text-red-700 dark:text-red-400 mt-1 ml-4 list-disc">
            <li>All tasks will be deleted</li>
            <li>All documents will be removed</li>
            <li>Team members will lose access</li>
          </ul>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Type DELETE"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## TESTING

After making all changes:
1. Save the file
2. The client should auto-reload
3. Click the three-dot menu (⋮) on any project
4. You should see "View Project" and "Delete Project" options
5. Click "Delete Project" to test the modal

---

## SUMMARY OF CHANGES

✅ Added 4 state variables for delete functionality  
✅ Added X icon import  
✅ Added 2 handler functions (handleDeleteProject, handleConfirmDelete)  
✅ Replaced three-dot button in grid view with dropdown  
✅ Replaced three-dot button in list view with dropdown  
✅ Added delete confirmation modal  

**Total lines to add/modify: ~150 lines**
