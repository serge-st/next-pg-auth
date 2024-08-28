'use client';

import { ChangeEvent, FC, ReactNode, useState } from 'react';
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
import { userSchema } from '@/app/api/users/user-schema';
import { z } from 'zod';

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
  const [value, setValue] = useState(initialValue);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Change property for the user with ID: <strong>{id}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={propertyToEdit} className="text-right">
              Name
            </Label>
            <Input
              id={propertyToEdit}
              value={value}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
