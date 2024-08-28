'use client';

import { ChangeEvent, KeyboardEvent, FC, ReactNode, useState, useContext } from 'react';
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
import { Icons } from '@/components/ui/icons';
import { userSchema } from '@/app/api/users/user-schema';
import { z } from 'zod';
import { capitalizeFirstLetter, cn } from '@/lib/utils/helpers';
import { UserPageContext } from '@/app/users/[id]/page';
import { useMutation } from '@tanstack/react-query';
import { apiClient, isApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface EditUserPropertyProps {
  children: ReactNode;
  id: number;
  propertyToEdit: keyof z.infer<typeof userSchema>;
  initialValue?: string;
}

export const EditUserProperty: FC<EditUserPropertyProps> = ({
  children,
  id,
  propertyToEdit,
  initialValue = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const { refetch } = useContext(UserPageContext);
  const { toast } = useToast();

  const { mutateAsync, isPending, isSuccess, error } = useMutation({
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

  const validate = (value: string): string | undefined => {
    const validationResult = userSchema.partial().safeParse({ [propertyToEdit]: value });
    const errorMessage = validationResult.error?.errors[0].message || 'Value is invalid';
    return validationResult.success ? undefined : errorMessage;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const errorMessage = validate(value);
    setInputError((prev) => (prev === errorMessage ? prev : errorMessage));
    setValue(value);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setValue(initialValue);
      setInputError(undefined);
    }
  };

  const getDescription = (): ReactNode => {
    return inputError ? (
      <span className="text-destructive">Error: {inputError}</span>
    ) : (
      <>
        Change property for the user with ID: <strong>{id}</strong>
      </>
    );
  };

  const diabled = !!inputError || !value || value === initialValue;

  const handleSuccess = () => {
    refetch();
    toast({
      title: `User with ID: ${id} was updated`,
    });
    setIsOpen(false);
  };

  const handleSave = async () => {
    await mutateAsync({ [propertyToEdit]: value });
    handleSuccess();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !diabled) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit user profile</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor={propertyToEdit}
              className={cn('text-right', !!inputError && 'text-destructive')}
            >
              {capitalizeFirstLetter(propertyToEdit)}
            </Label>
            <Input
              id={propertyToEdit}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={diabled} className="w-[126px]">
            {isPending ? <Icons.spinner className="animate-spin" /> : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
