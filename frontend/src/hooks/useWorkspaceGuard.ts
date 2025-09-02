import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { pageApi } from '@/services/pageApi';
import { itemApi } from '@/services/itemApi';

interface WorkspaceGuardOptions {
  type: 'page' | 'item';
  redirectOnInvalid?: boolean;
}

export const useWorkspaceGuard = ({ type, redirectOnInvalid = true }: WorkspaceGuardOptions) => {
  const { pageId, itemId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateWorkspaceAccess = async () => {
      if (!currentWorkspace) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }

      try {
        setIsValidating(true);
        let belongsToWorkspace = false;

        if (type === 'page' && pageId) {
          try {
            const response = await pageApi.getPage(pageId, currentWorkspace._id);
            belongsToWorkspace = response.page.workspace === currentWorkspace._id;
            
            if (!belongsToWorkspace) {
              toast({
                title: 'Access Denied',
                description: `This page belongs to a different workspace. Redirecting to ${currentWorkspace.name}.`,
                variant: 'destructive',
                action: redirectOnInvalid ? undefined : {
                  label: 'Switch Workspace',
                  onClick: () => navigate('/home'),
                },
              });
            }
          } catch (error) {
            console.error('Error validating page workspace:', error);
            belongsToWorkspace = false;
            toast({
              title: 'Page Not Found',
              description: 'The requested page could not be found or you do not have access to it.',
              variant: 'destructive',
            });
          }
        } else if (type === 'item' && itemId) {
          try {
            const response = await itemApi.getItem(itemId);
            belongsToWorkspace = response.item.workspace === currentWorkspace._id;
            
            if (!belongsToWorkspace) {
              toast({
                title: 'Access Denied',
                description: `This item belongs to a different workspace. Redirecting to ${currentWorkspace.name}.`,
                variant: 'destructive',
                action: redirectOnInvalid ? undefined : {
                  label: 'Switch Workspace',
                  onClick: () => navigate('/home'),
                },
              });
            }
          } catch (error) {
            console.error('Error validating item workspace:', error);
            belongsToWorkspace = false;
            toast({
              title: 'Item Not Found',
              description: 'The requested item could not be found or you do not have access to it.',
              variant: 'destructive',
            });
          }
        } else {
          // No specific ID, allow access (for general pages like /items)
          belongsToWorkspace = true;
        }

        setIsValid(belongsToWorkspace);

        // Redirect if invalid and redirectOnInvalid is true
        if (!belongsToWorkspace && redirectOnInvalid) {
          setTimeout(() => {
            navigate('/home');
          }, 2000); // Give user time to read the toast
        }
      } catch (error) {
        console.error('Workspace validation error:', error);
        setIsValid(false);
        
        if (redirectOnInvalid) {
          toast({
            title: 'Error',
            description: 'There was an error validating workspace access.',
            variant: 'destructive',
          });
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateWorkspaceAccess();
  }, [currentWorkspace, pageId, itemId, type, navigate, toast, redirectOnInvalid]);

  return {
    isValidating,
    isValid,
    currentWorkspace,
  };
};
