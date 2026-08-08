import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook orchestrating live crumple & toss deletion animation sequence.
 */
export const useDeleteAnimation = () => {
  const { showSuccess, showError } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    id: null,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    deleteApiFn: null,
    onOptimisticRemove: null,
    onRestore: null,
    onSuccess: null,
    onError: null,
  });

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

  const closeModal = useCallback(() => {
    if (isDeleting) return; // Prevent closing while animation in progress
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [isDeleting]);

  const handleProceedDelete = useCallback(async () => {
    const { id, item, deleteApiFn, onOptimisticRemove, onRestore, onSuccess, onError } = modalState;
    if (!id || !deleteApiFn || isDeleting) return;

    setIsDeleting(true);
    setShowOverlay(true);

    // Run 1.2s Live Crumple & Toss Physics Animation
    setTimeout(async () => {
      setShowOverlay(false);
      setIsDeleting(false);
      setModalState((prev) => ({ ...prev, isOpen: false }));

      // Optimistically remove from UI
      if (onOptimisticRemove) onOptimisticRemove(id, item);

      try {
        await deleteApiFn(id, item);
        if (onSuccess) onSuccess(id, item);
        showSuccess(`"${item?.fullName || item?.name || item?.documentName || item?.title || 'Item'}" deleted successfully.`);
      } catch (err) {
        console.error(`Delete failed for item ${id}:`, err);
        if (onRestore) onRestore(id, item);
        if (onError) onError(err);
        showError(`Delete failed. Item restored.`);
      }
    }, 1200);
  }, [modalState, isDeleting, showSuccess, showError]);

  return {
    confirmDelete,
    closeModal,
    handleProceedDelete,
    modalState,
    isDeleting,
    showOverlay,
  };
};
export const useDeleteWithUndo = useDeleteAnimation;
export default useDeleteAnimation;
