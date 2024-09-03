'use client';

import { FC, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { apiClient, isApiError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';
import { localStorageAccessToken } from '@/lib/utils/helpers';

interface LoginFormProps {}

export const LoginForm: FC<LoginFormProps> = () => {
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    formError: z.string().optional(),
  });

  const { mutate, isPending, isSuccess, data } = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return apiClient.post('/auth/login', values).then((res) => res.data);
    },
    onError: (error) => {
      const isCritical = isApiError(error) && error.response.status === 500;
      const erroMessage = isCritical
        ? 'Unexpected error occurred'
        : 'Please check you login credentials';

      form.setError('formError', {
        type: 'manual',
        message: erroMessage,
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!isSuccess) return;
    form.reset();
    localStorageAccessToken.set(data.access_token);
    redirect(`/users`);
  }, [form, isSuccess, data]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  const { formError } = form.formState.errors;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-w-[300px] flex-col gap-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>

              <div className="h-5">
                <FormMessage />
              </div>
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
              <div className="h-5">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="h-5">
          <FormMessage>{formError?.message}</FormMessage>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? <Icons.spinner className="animate-spin" /> : 'Login'}
        </Button>
      </form>
    </Form>
  );
};
