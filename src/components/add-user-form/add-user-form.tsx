'use client';

import { FC } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input, Button } from '@/components/ui';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { apiClient } from '@/lib/api/api-client';

interface AddUserFormProps {
  availableRoles: string[];
}

export const AddUserForm: FC<AddUserFormProps> = ({ availableRoles }) => {
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.string().refine((role) => availableRoles.includes(role), {
      message: 'Role must be one of the available roles.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO add animation while form is submitting
    apiClient.post('/users', values);
    form.reset();
  }

  const onError = (errors: any) => {
    console.log('Form errors:', errors);
    const currentValues = form.getValues();
    console.log('Current form values:', currentValues);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex min-w-[300px] flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The email will be used as a login</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Minimum 8 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`User's Role`}</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {capitalizeFirstLetter(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Please select a role</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
