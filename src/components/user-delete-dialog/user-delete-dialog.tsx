import { apiClient } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { FC, useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserDeleteDialogProps {
  id: number;
}

export const UserDeleteDialog: FC<UserDeleteDialogProps> = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: () => {
      return apiClient.delete(`/users/${id}`);
    },
  });

  function handleDelete() {
    mutate();
  }

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      redirect('/users');
    }
  }, [isSuccess]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{error ? 'Some error occured' : 'Are you sure?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {error
              ? 'You can try again later...'
              : `This action cannot be undone. This will permanently delete user's account.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>
          {!error && (
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' }) + ' w-[75px]'}
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Icons.spinner className="animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
