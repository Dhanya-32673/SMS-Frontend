import { useState, useRef, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook to handle live delete animations with a 5-second Undo grace period.
 */
export const useDeleteWithUndo = () => {
  const { showUndoToast, showSuccess, showError } = useToast();
  
  // Pending delete requests map: id -> { timerId, item, deleteApiFn, restoreFn, successFn, errorFn }
  const pendingDeletesRef = useRef(new Map());

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    id: null,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item? This action will take effect in 5 seconds unless undone.',
    deleteApiFn: null,
    onOptimisticRemove: null,
    onRestore: null,
    onSuccess: null,
    onError: null,
  });

  // Open confirmation modal
  const confirmDelete = useCallback(({
    id,
    item,
    title = 'Delete Item',
    message = 'Are you sure you want to delete this item?',
    deleteApiFn,
    onOptimisticRemove,
    onRestore,
    onSuccess,
    onError,
  }) => {
    setModalState({
      isOpen: true,
      id,
      item,
      title,
      message,
      deleteApiFn,
      onOptimisticRemove,
      onRestore,
      onSuccess,
      onError,
    });
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Execute deletion request after confirmation
  const handleProceedDelete = useCallback(() => {
    const { id, item, title, deleteApiFn, onOptimisticRemove, onRestore, onSuccess, onError } = modalState;
    closeModal();

    if (!id || !deleteApiFn) return;

    // 1. Perform optimistic UI removal immediately
    if (onOptimisticRemove) {
      onOptimisticRemove(id, item);
    }

    // 2. Set up 5-second deferred backend execution timer
    const timerId = setTimeout(async () => {
      pendingDeletesRef.current.delete(id);
      try {
        await deleteApiFn(id, item);
        if (onSuccess) onSuccess(id, item);
        showSuccess(`"${item?.name || item?.studentName || item?.title || 'Item'}" deleted permanently.`);
      } catch (err) {
        console.error(`Permanent delete failed for item ${id}:`, err);
        if (onRestore) onRestore(id, item);
        if (onError) onError(err);
        showError(`Delete failed for "${item?.name || item?.studentName || item?.title || 'Item'}". Restored.`);
      }
    }, 5000);

    // Store pending delete entry
    pendingDeletesRef.current.set(id, {
      timerId,
      item,
      onRestore,
    });

    // 3. Show 5-second Undo Toast
    const itemLabel = item?.name || item?.studentName || item?.sectionName || item?.title || 'Item';
    showUndoToast({
      message: `"${itemLabel}" moved to trash`,
      durationMs: 5000,
      onUndo: () => {
        // Cancel pending delete
        const pending = pendingDeletesRef.current.get(id);
        if (pending) {
          clearTimeout(pending.timerId);
          pendingDeletesRef.current.delete(id);
          if (onRestore) onRestore(id, item);
          showSuccess(`Restored "${itemLabel}".`);
        }
      },
    });
  }, [modalState, closeModal, showUndoToast, showSuccess, showError]);

  return {
    confirmDelete,
    closeModal,
    handleProceedDelete,
    modalState,
  };
};
export const useDeleteAnimation = useDeleteWithUndo;
export default useDeleteWithUndo;
