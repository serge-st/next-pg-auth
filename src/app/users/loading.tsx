import { Icons } from '@/components/ui/icons';

export default function Loading() {
  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="h-12 w-12">
        <Icons.spinner className="h-full w-full animate-spin" />
      </div>
    </div>
  );
}
