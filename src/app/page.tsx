import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-center">
        Calendar.ai
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground text-center max-w-2xl">
        A very strong foundation for a scalable smart calendar application.
        Built with Next.js 14+, TypeScript, Tailwind CSS, and Shadcn/UI.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button size="lg">Get Started</Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
    </div>
  );
}
