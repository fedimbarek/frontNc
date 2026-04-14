import { Pipe, PipeTransform } from '@angular/core';
import { Complaint, ComplaintStatus } from '../../../models/complaint.model';

@Pipe({
  name: 'filterByStatus'
})
export class FilterByStatusPipe implements PipeTransform {
  transform(complaints: Complaint[], status: ComplaintStatus): number {
    if (!complaints) return 0;
    return complaints.filter(c => c.status === status).length;
  }
}
