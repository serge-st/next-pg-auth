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
import { apiClient } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Icons } from '../ui/icons';
import { UserWithRoleAsArray } from '@/lib/types';
import { userSchema } from '@/app/api/users/user-schema';
import { z } from 'zod';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditUserPropertyProps {
  id: number;
  children: ReactNode;
  propertyToEdit: keyof z.infer<typeof userSchema>;
  currentValue?: string;
}

const UserRoleSelect: FC<{
  roles: string[];
  onSelectChange: (value: string) => void;
  value: string;
}> = ({ value, roles, onSelectChange }) => {
  return (
    <Select onValueChange={(value) => onSelectChange(value)} value={value}>
      <Label htmlFor="role" className="text-right">
        Role
      </Label>
      <SelectTrigger className="col-span-3" id="role">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {capitalizeFirstLetter(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const EditUserProperty: FC<EditUserPropertyProps> = ({
  id,
  children,
  propertyToEdit,
  currentValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string>(currentValue || '');
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const isRoleEdit = propertyToEdit === 'role';

  const {
    isPending,
    error,
    data: roles,
    isSuccess,
  } = useQuery<string[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get(`/roles?names_only=true`).then((res) => res.data),
    retry: 1,
    enabled: isRoleEdit,
  });

  const {
    mutate,
    isPending: mutationIsPending,
    isSuccess: mutationIsSuccess,
    error: mutationError,
  } = useMutation({
    mutationFn: () => {
      return apiClient.patch(`/users/${id}`);
    },
  });

  function handleSubmit() {
    mutate();
  }

  useEffect(() => {
    if (isSuccess) {
      //   setIsOpen(false);
      //   redirect('/users');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validationResult = userSchema.partial().safeParse({ [propertyToEdit]: e.target.value });
    const errorMessage = validationResult.success
      ? undefined
      : validationResult.error?.errors[0].message || 'Form is invalid';
    console.log('errorMessage', errorMessage);
    setInputError(errorMessage);
    setValue(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button type="submit" onSubmit={handleSubmit}>
            {mutationIsPending ? <Icons.spinner className="animate-spin" /> : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
