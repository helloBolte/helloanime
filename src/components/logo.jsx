import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center justify-center h-full bg-none rounded-full overflow-hidden p-0">
      <div className="relative h-16 w-16 p-0 rounded-full">
        <Image src="/logo.gif" alt="Logo" layout="fill" objectFit='contain' />
      </div>
    </div>
  );
}
