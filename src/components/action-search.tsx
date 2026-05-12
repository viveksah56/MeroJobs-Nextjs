"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {AudioLines, BarChart2, Globe, PlaneTakeoff, Search, Send, Video} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import useDebounce from "@/hooks/use-debounce";

interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
}

const ALL_ACTIONS: Action[] = [
    {
        id: "1",
        label: "Book tickets",
        icon: <PlaneTakeoff className="h-4 w-4 text-blue-500"/>,
        description: "Operator",
        short: "⌘K",
        end: "Agent"
    },
    {
        id: "2",
        label: "Summarize",
        icon: <BarChart2 className="h-4 w-4 text-orange-500"/>,
        description: "gpt-4o",
        short: "⌘P",
        end: "Command"
    },
    {
        id: "3",
        label: "Screen Studio",
        icon: <Video className="h-4 w-4 text-purple-500"/>,
        description: "gpt-4o",
        short: "",
        end: "Application"
    },
    {
        id: "4",
        label: "Talk to Jarvis",
        icon: <AudioLines className="h-4 w-4 text-green-500"/>,
        description: "gpt-4o voice",
        short: "",
        end: "Active"
    },
    {
        id: "5",
        label: "Translate",
        icon: <Globe className="h-4 w-4 text-blue-500"/>,
        description: "gpt-4o",
        short: "",
        end: "Command"
    }, {
        id: "6",
        label: "Translate",
        icon: <Globe className="h-4 w-4 text-blue-500"/>,
        description: "gpt-4o",
        short: "",
        end: "Command"
    }, {
        id: "7",
        label: "Translate",
        icon: <Globe className="h-4 w-4 text-blue-500"/>,
        description: "gpt-4o",
        short: "",
        end: "Command"
    },
];

interface ActionSearchProps {
    actions?: Action[];
}

export default function ActionSearch({actions = ALL_ACTIONS}: ActionSearchProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [filteredActions, setFilteredActions] = useState<Action[]>(actions);
    const debouncedQuery = useDebounce(query, 200);
    const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isFocused) return;
        if (!debouncedQuery.trim()) {
            setTimeout(() => setFilteredActions(actions), 0);
            return;
        }
        const q = debouncedQuery.toLowerCase().trim();
        setTimeout(() => setFilteredActions(actions.filter((a) => a.label.toLowerCase().includes(q))), 0);
    }, [debouncedQuery, isFocused, actions]);

    const handleFocus = useCallback(() => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
        setSelectedAction(null);
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        blurTimer.current = setTimeout(() => setIsFocused(false), 200);
    }, []);

    const handleSelect = useCallback((action: Action) => {
        setSelectedAction(action);
        setQuery(action.label);
        setIsFocused(false);
    }, []);

    const handleClick = useCallback(() => {
        if (!isFocused) {
            handleFocus();
        }
    }, [isFocused, handleFocus]);

    const showDropdown = isFocused && !selectedAction;

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="relative">
                <Label htmlFor="action-search" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Search Commands
                </Label>

                <div className="relative">
                    <Input
                        id="action-search"
                        type="text"
                        placeholder="What's up?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={cn('pr-9 h-9 text-sm bg-background border-primary')}
                        autoComplete="off"
                        onClick={handleClick}
                    />
                    <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        {query.length > 0 ? (
                            <Send className="h-4 w-4" aria-hidden="true"/>
                        ) : (
                            <Search className="h-4 w-4" aria-hidden="true"/>
                        )}
                    </div>
                </div>

                {showDropdown && (
                    <div className={cn(
                        "absolute top-full left-0 right-0 z-50 mt-1.5",
                        "rounded-md border border-border bg-popover shadow-md",
                        "overflow-hidden"
                    )}>
                        <ScrollArea className={cn('max-h-[240px]', 'overflow-scroll')}>
                            <ul role="listbox" aria-label="Command results">
                                {filteredActions.length > 0 ? (
                                    filteredActions.map((action) => (
                                        <li
                                            key={action.id}
                                            role="option"
                                            aria-selected="false"
                                            onClick={() => handleSelect(action)}
                                            className={cn(
                                                "flex items-center justify-between",
                                                "px-3 py-2.5 mx-1 my-0.5 rounded-sm",
                                                "text-sm cursor-pointer select-none",
                                                "text-popover-foreground",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                "transition-colors duration-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="shrink-0 text-muted-foreground">
                                                    {action.icon}
                                                </span>
                                                <span className="font-medium truncate">{action.label}</span>
                                                {action.description && (
                                                    <span
                                                        className="text-xs text-muted-foreground shrink-0">{action.description}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                {action.short && (
                                                    <kbd
                                                        className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                                                        {action.short}
                                                    </kbd>
                                                )}
                                                {action.end && (
                                                    <span
                                                        className="text-[11px] text-muted-foreground">{action.end}</span>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-4 text-sm text-center text-muted-foreground">
                                        No results found
                                    </li>
                                )}
                            </ul>
                        </ScrollArea>

                        <Separator/>

                        <div
                            className={cn('flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground',
                                'bg-primary')}>
                            <span>Press ⌘K to open commands</span>
                            <span>ESC to cancel</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}