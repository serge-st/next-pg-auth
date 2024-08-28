import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { Label } from '@radix-ui/react-label';
import { FC } from 'react';

export const UserRoleSelect: FC<{
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
