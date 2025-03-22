import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center justify-center h-full bg-none overflow-hidden p-0">
      <div className="relative h-20 w-20 p-0">
        <Image src="/logo.png" alt="Logo" layout="fill" objectFit='contain' />
      </div>
    </div>
  );
}
