import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tag } from '@/services/tagApi';

interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  isSelected?: boolean;
  onSelect?: (tagId: string) => void;
}

const TagCard: React.FC<TagCardProps> = ({
  tag,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(tag._id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{tag.name}</h3>
              {tag.description && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {tag.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground">
                  {tag.itemCount} items
                </span>
                <span className="text-xs text-muted-foreground">
                  {tag.usageCount} uses
                </span>
                {tag.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
                {tag.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setDropdownOpen(false);
                // Use setTimeout to ensure dropdown fully closes before opening modal
                setTimeout(() => onEdit(tag), 0);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDropdownOpen(false);
                  setTimeout(() => onDelete(tag._id), 0);
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {tag.aiKeywords.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 mb-2">
              <TagIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">AI Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tag.aiKeywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {tag.aiKeywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tag.aiKeywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TagCard;
