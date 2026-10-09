"use client";

import { useRouter } from "next/navigation";
import { Eye, HandHeart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { PuedeSerChoice } from "@/types/pet";

type Props = {
  choice: PuedeSerChoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PuedeSerChoiceSheet({ choice, open, onOpenChange }: Props) {
  const router = useRouter();
  if (!choice) return null;

  const goFound = () => {
    onOpenChange(false);
    router.push(
      `/publicar/encontrada?targetLostPostId=${encodeURIComponent(choice.targetLostPostId)}`,
    );
  };

  const goSighting = () => {
    onOpenChange(false);
    router.push(
      `/publicar/avistamiento?lostPostId=${encodeURIComponent(choice.targetLostPostId)}`,
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-left">
          <SheetTitle className="font-heading text-xl font-semibold">
            ¿Qué pasó con {choice.targetName}?
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            No tenés un aviso de hallazgo activo. Elegí cómo querés ayudar.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-3 px-4">
          <Button
            size="lg"
            className="pf-btn-emphasis h-auto whitespace-normal rounded-xl px-4 py-3.5 text-left shadow-none"
            onClick={goFound}
          >
            <HandHeart className="mt-0.5 size-5 shrink-0" />
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-semibold">¿La tenés o la podés cuidar?</span>
              <span className="text-xs font-normal opacity-90">
                Publicá un hallazgo y pedimos match con este aviso
              </span>
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto whitespace-normal rounded-xl px-4 py-3.5 text-left"
            onClick={goSighting}
          >
            <Eye className="mt-0.5 size-5 shrink-0" />
            <span className="flex flex-col items-start gap-0.5">
              <span className="font-semibold">
                ¿La viste pero no pudiste agarrarla?
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Reportá un avistamiento sin cerrar la búsqueda
              </span>
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
