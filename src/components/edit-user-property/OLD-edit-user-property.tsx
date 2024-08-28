import { FC, ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient, isApiError } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Icons } from '../ui/icons';
import { userSchema } from '@/app/api/users/user-schema';
import { z } from 'zod';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { UserRoleSelect } from '@/components/user-role-select';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditUserPropertyProps {
  id: number;
  children: ReactNode;
  propertyToEdit: keyof z.infer<typeof userSchema>;
  initialValue?: string;
}

export const EditUserProperty: FC<EditUserPropertyProps> = ({
  id,
  children,
  propertyToEdit,
  initialValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string>(initialValue || '');
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const isRoleEdit = propertyToEdit === 'role';
  const { toast } = useToast();

  const {
    isPending: isRolesPending,
    error: rolesError,
    data: roles,
    isSuccess: isRolesSuccess,
  } = useQuery<string[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get(`/roles?names_only=true`).then((res) => res.data),
    retry: 1,
    enabled: isRoleEdit,
  });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (values: Partial<z.infer<typeof userSchema>>) => {
      return apiClient.patch(`/users/${id}`, values);
    },
    onError: (error) => {
      const erroMessage = isApiError(error)
        ? error.response.data.error.toString()
        : 'Unexpected error occurred';
      setInputError(erroMessage);
    },
  });

  const handleSubmit = () => {
    mutate({ [propertyToEdit]: value });
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: `User ${id} was updated`,
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validationResult = userSchema.partial().safeParse({ [propertyToEdit]: e.target.value });
    const errorMessage = validationResult.success
      ? undefined
      : validationResult.error?.errors[0].message || 'Form is invalid';
    setInputError(errorMessage);
    setValue(e.target.value);
  };

  const handleDialogClose = (open: boolean) => {
    if (isSuccess) return setIsOpen(false);
    setIsOpen(open);
    setInputError(undefined);
    setValue(initialValue || '');
  };

  const form = useForm<Partial<z.infer<typeof userSchema>>>({
    resolver: zodResolver(userSchema.partial()),
    defaultValues: {
      [propertyToEdit]: initialValue,
    },
    mode: 'onChange',
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {capitalizeFirstLetter(propertyToEdit)}</DialogTitle>
          {inputError ? (
            <DialogDescription className="text-red-500">Error: {inputError}</DialogDescription>
          ) : (
            <DialogDescription>
              Change property for the user with ID: <strong>{id}</strong>
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {isRoleEdit ? (
              <UserRoleSelect roles={roles || []} value={value} onSelectChange={setValue} />
            ) : (
              <>
                <Label htmlFor={propertyToEdit} className="text-right">
                  {capitalizeFirstLetter(propertyToEdit)}
                </Label>
                <Input
                  id={propertyToEdit}
                  autoComplete="off"
                  value={value}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-[126px]"
            type="submit"
            disabled={!!inputError || value === initialValue || value === ''}
          >
            {isPending ? <Icons.spinner className="animate-spin" /> : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
