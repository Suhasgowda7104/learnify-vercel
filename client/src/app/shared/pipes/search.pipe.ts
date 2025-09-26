import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  standalone: false
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, searchField: string): any[] {
    if (!items || !searchTerm || !searchField) {
      return items;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
      const fieldValue = this.getNestedProperty(item, searchField);
      return fieldValue && fieldValue.toString().toLowerCase().includes(term);
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current && current[prop], obj);
  }
}