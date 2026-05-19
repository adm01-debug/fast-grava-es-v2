import { useState, useEffect, useMemo } from 'react';
import { useInventory } from '@/features/inventory';
import { useOperatorDashboardData } from '@/features/production';
import { Package, Printer, FileText, User } from 'lucide-react';
import { CommandItemType } from './CommandPaletteCommands';
import { useNavigate } from 'react-router-dom';

export function useCommandEntities(query: string, setOpen: (open: boolean) => void) {
  const { items: inventoryItems } = useInventory();
  const { machines } = useOperatorDashboardData();
  const navigate = useNavigate();

  const entityResults = useMemo(() => {
    if (query.length < 2) return [];

    const results: CommandItemType[] = [];
    const lowerQuery = query.toLowerCase();

    // Search Inventory
    inventoryItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) || 
      item.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 3).forEach(item => {
      results.push({
        id: `entity-inv-${item.id}`,
        name: item.name,
        description: `Estoque: ${item.current_stock} ${item.unit} | ${item.category}`,
        icon: <Package className="h-4 w-4 text-amber-500" />,
        action: () => {
          navigate('/inventory');
          setOpen(false);
        },
        category: 'search',
        priority: 50
      });
    });

    // Search Machines
    machines.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) || 
      m.id.toLowerCase().includes(lowerQuery)
    ).slice(0, 3).forEach(machine => {
      results.push({
        id: `entity-mach-${machine.id}`,
        name: machine.name,
        description: `Status: ${machine.status} | Máquina Industrial`,
        icon: <Printer className="h-4 w-4 text-blue-500" />,
        action: () => {
          navigate('/machines');
          setOpen(false);
        },
        category: 'search',
        priority: 50
      });
    });

    return results;
  }, [query, inventoryItems, machines, navigate, setOpen]);

  return entityResults;
}
