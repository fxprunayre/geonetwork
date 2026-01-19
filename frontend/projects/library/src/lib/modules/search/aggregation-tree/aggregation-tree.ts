import { DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationBucketType } from '../aggregation/aggregation.component';
import { SearchBase } from '../search-base/search-base';
import { SearchFilterChange } from '../search.store.model';

@Component({
  selector: 'app-aggregation-tree',
  imports: [Tree],
  template: ` <p-tree
    [value]="treeNodes()"
    selectionMode="checkbox"
    [(selection)]="selectedBuckets"
    (selectionChange)="onNodeSelectionChange($event)"
    class="w-full p-0!"
    appendTo="body"
    [filter]="isFilterEnabled()"
    [pt]="{ nodeLabel: { class: 'break-all' } }"
  >
  </p-tree>`,
})
export class AggregationTree extends SearchBase implements AfterViewInit {
  keyName = input.required<string>();
  buckets = input<AggregationBucketType[]>();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

  translateService = inject(TranslateService);
  aggregationTranslatePipe = inject(AggregationTranslatePipe);
  decimalPipe = inject(DecimalPipe);

  separator = input<string>('^');

  isFilterEnabled = computed(() => {
    const buckets = this.buckets();
    return (buckets?.length ?? 0) > 10;
  });

  selection = signal<TreeNode[] | undefined>(undefined);
  selection$ = toObservable(this.selection);

  onNodeSelectionChange(node: TreeNode<any> | TreeNode<any>[] | null | undefined) {
    // Node propagation occurs, observable selection is updated
    this.selection.update(() => {
      if (Array.isArray(node)) {
        return node;
      }
      return node ? [node] : [];
    });
  }

  // Convert bucket keys like "A^B^C"
  // into a tree structure usable by p-tree
  // with nodes A -> B -> C
  // data.key holds the original bucket key
  treeNodes = computed(() => {
    const root: TreeNode[] = [];
    const buckets = this.buckets();

    if (!buckets) {
      return root;
    }

    buckets.forEach((bucket) => {
      const parts = (bucket.key as string).split(this.separator());
      let currentLevel = root;
      let parentLabel: string = '';

      parts.forEach((part, index) => {
        let existingNode = currentLevel.find((node) => node.key === part);
        const translatedLabel = this.aggregationTranslatePipe.transform(
          part,
          this.keyName(),
        ) as string;

        if (!existingNode) {
          let label = translatedLabel;
          // This is Sextant specific where parent labels are prefixed to child labels
          if (parentLabel && label.startsWith(parentLabel)) {
            label = label.replace(parentLabel, '');
            label = label.replace(/^[\s\/]+/, '');
          }

          existingNode = {
            key: part,
            data: { key: bucket.key },
            label: `${label}  (${this.decimalPipe.transform(bucket.doc_count, undefined, this.translateService.getCurrentLang())})`,
            checked: this.search.isFilterActive(this.keyName(), bucket.key),
            children: [],
          };
          currentLevel.push(existingNode);
        }

        parentLabel = translatedLabel;
        currentLevel = existingNode.children!;
      });
    });

    // order tree if meta.orderByTranslation is set
    const orderTree = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.label!.localeCompare(b.label!));
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          orderTree(node.children);
        }
      });
    };

    const aggregationMeta = this.search.aggregations()[this.keyName()]?.meta;
    if (aggregationMeta?.orderByTranslation) {
      orderTree(root);
    }

    // Expand nodes that have selected children
    const expandSelected = (nodes: TreeNode[], parentPath: string): boolean => {
      let anyChildSelected = false;
      for (const node of nodes) {
        const fullKey = parentPath ? parentPath + this.separator() + node.key : node.key;
        const isSelected = node.checked;
        const childrenSelected = node.children
          ? expandSelected(node.children, fullKey as string)
          : false;

        if (childrenSelected) {
          node.expanded = true;
          node.partialSelected = !isSelected;
          anyChildSelected = true;
        }

        if (isSelected) {
          anyChildSelected = true;
        }
      }
      return anyChildSelected;
    };

    expandSelected(root, '');

    return root;
  });

  selectedBuckets = signal<TreeNode[]>([]);

  constructor() {
    super();

    this.selection$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((nodes) => {
      if (!nodes) {
        return;
      }
      const selectedKeys = nodes.map((node) => node.data.key);
      this.onSelected.emit({
        field: this.keyName(),
        values: selectedKeys,
        add: true,
      });
    });
  }

  ngAfterViewInit(): void {
    this.selectedBuckets.update(() => {
      const selectedNodes: TreeNode[] = [];
      const traverse = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (node.checked) {
            selectedNodes.push(node);
          }

          if (node.children) {
            traverse(node.children);
          }
        }
      };
      traverse(this.treeNodes());
      return selectedNodes;
    });
  }
}
