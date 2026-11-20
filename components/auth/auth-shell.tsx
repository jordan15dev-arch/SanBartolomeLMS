import Link from "next/link";
import { SchoolIllustration } from "./school-illustration";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[min(790px,calc(100vh-3rem))] w-full max-w-[1120px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(10,37,64,0.16)] lg:grid-cols-[45%_55%]">
        <aside className="relative flex min-h-[400px] flex-col overflow-hidden bg-navy px-7 py-8 text-white sm:px-10 sm:py-10 lg:min-h-[720px] lg:px-12">
          <Link href="/login" className="flex items-center gap-3" aria-label="San Bartolome High School home">
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-gold text-[11px] font-bold tracking-[0.12em] text-gold">
              SB<br />1987
            </span>
            <span>
              <span className="block text-[15px] font-bold leading-tight sm:text-base">San Bartolome High School</span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.16em] text-[#AFC2D2] sm:text-[10px]">
                LEARNING MANAGEMENT SYSTEM
              </span>
            </span>
          </Link>

          <section className="mt-11 max-w-[390px] lg:mt-[72px]">
            <p className="text-[11px] font-bold tracking-[0.2em] text-gold">LEARN · GROW · LEAD</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.12] tracking-[-0.035em] sm:text-[42px]">
              Learning without boundaries.
            </h1>
            <p className="mt-4 max-w-[350px] text-sm leading-6 text-[#C2D0DC]">
              Your lessons, progress, and school community—all in one place.
            </p>
          </section>

          <div className="mt-7 flex flex-1 items-end justify-center lg:mt-0 lg:pb-2">
            <SchoolIllustration />
          </div>
          <p className="mt-5 text-xs text-[#AFC2D2]">Established 1987 · Quezon City</p>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="w-full max-w-[430px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
