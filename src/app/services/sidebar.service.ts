import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(this.getInitialState());
  collapsed$ = this.collapsedSubject.asObservable();

  constructor() {}

  private getInitialState(): boolean {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  }

  toggle(): void {
    this.setCollapsed(!this.collapsedSubject.value);
  }

  setCollapsed(val: boolean): void {
    this.collapsedSubject.next(val);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(val));
  }

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }
}
