import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Order = {
  orderRef: string;
  client: string;
  date?: string;
  status?: string;
  qty: number;
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AdminOrdersComponent {
  // Temporary data to check the layout
  designing: Order[] = [
    { orderRef: 'ORD-001', client: 'Juan Dela Cruz', date: '2024-06-01', status: 'Designing', qty: 50 },
    { orderRef: 'ORD-002', client: 'Maria Clara', date: '2024-06-02', status: 'Designing', qty: 30 }
  ];

  ripping: Order[] = [
    // example, keep empty if you want
  ];
  heatpress: Order[] = [];
  cutting: Order[] = [];
  assembly: Order[] = [];
  qc: Order[] = [];
  done: Order[] = [];

  // list of stages used for generating columns
  stages = [
    { key: 'designing', title: 'Designing', data: this.designing },
    { key: 'ripping', title: 'Ripping', data: this.ripping },
    { key: 'heatpress', title: 'Heatpress', data: this.heatpress },
    { key: 'cutting', title: 'Cutting', data: this.cutting },
    { key: 'assembly', title: 'Assembly/Sew', data: this.assembly },
    { key: 'qc', title: 'Quality Check', data: this.qc },
    { key: 'done', title: 'Done', data: this.done }
  ];

  // used by cdkDropListConnectedTo
  get connectedLists(): string[] {
    return this.stages.map(s => s.key);
  }

  constructor() { }

  // CDK drop handler
  onDrop(event: CdkDragDrop<Order[]>, destKey: string) {
    // same container
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // optional: update moved item's status string to reflect new column title
      const moved = event.container.data[event.currentIndex];
      const destStage = this.stages.find(s => s.key === destKey);
      if (moved && destStage) moved.status = destStage.title;
    }
  }

  // change via dropdown inside card
  changeStatus(order: Order, toKey: string) {
    if (!order) return;
    const fromStage = this.stages.find(s => s.data.includes(order));
    const toStage = this.stages.find(s => s.key === toKey);
    if (!toStage || !fromStage) return;
    // remove from previous
    fromStage.data.splice(fromStage.data.indexOf(order), 1);
    // push to front of new stage
    toStage.data.unshift(order);
    order.status = toStage.title;
  }

  // trackBy for performance
  trackByOrder(index: number, item: Order) {
    return item.orderRef || index;
  }
}
