import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Booking } from '../../bookings.service';

interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

interface NormalisedBooking {
  booking: Booking;
  start: Date;
  end: Date;
}

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-calendar.component.html'
})
export class BookingCalendarComponent implements OnChanges {
  @Input({ required: true }) bookings: Booking[] = [];

  viewDate = new Date();
  weeks: CalendarCell[][] = [];
  private normalised: NormalisedBooking[] = [];

  ngOnChanges(): void {
    this.normaliseBookings();
    this.buildCalendar();
  }

  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  private buildCalendar(): void {
    const startOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const endOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const firstCell = new Date(startOfMonth);
    firstCell.setDate(startOfMonth.getDate() - startDay);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: CalendarCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstCell);
      date.setDate(firstCell.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const inCurrentMonth = date >= startOfMonth && date <= endOfMonth;
      const matches = this.normalised
        .filter(nb => date >= nb.start && date <= nb.end)
        .map(nb => nb.booking);
      cells.push({
        date,
        inCurrentMonth,
        isToday: date.getTime() === today.getTime(),
        bookings: matches
      });
    }

    this.weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      this.weeks.push(cells.slice(i, i + 7));
    }
  }

  private normaliseBookings(): void {
    this.normalised = (this.bookings || []).map(b => {
      const start = this.parseDate(b.startDate);
      const end = b.endDate ? this.parseDate(b.endDate) : start;
      return { booking: b, start, end };
    });
  }

  private parseDate(value: string | null | undefined): Date {
    const date = value ? new Date(value) : new Date();
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return normalized;
  }
}
