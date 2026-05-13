import * as React from "react"
import { format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "h-8 justify-start text-left font-normal bg-card hover:bg-accent border-primary/20",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yy", { locale: ptBR })
              )
            ) : (
              <span>Selecionar período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-primary/20" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={ptBR}
          />
          <div className="p-3 border-t border-border flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7"
              onClick={() => setDate({ from: new Date(), to: new Date() })}
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7"
              onClick={() => setDate({ from: subDays(new Date(), 7), to: new Date() })}
            >
              7 dias
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7"
              onClick={() => setDate({ from: subDays(new Date(), 30), to: new Date() })}
            >
              30 dias
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
