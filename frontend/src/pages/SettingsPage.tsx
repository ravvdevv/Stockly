import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
    Settings,
    Percent,
    Save,
    Moon,
    Sun,
    Monitor,
    Database,
    Download,
    Upload,
    Trash2,
    Info,
    Github
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    const [taxRate, setTaxRate] = useState<number>(12);
    const [isLoading, setIsLoading] = useState(true);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const rate = await window.go.main.App.GetTaxRate();
                setTaxRate(rate);
            } catch (error) {
                console.error('Failed to fetch tax rate:', error);
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveTaxRate = async () => {
        try {
            await window.go.main.App.SaveTaxRate(taxRate);
            toast.success('Tax rate updated successfully');
        } catch (error) {
            console.error('Failed to save tax rate:', error);
            toast.error('Failed to save tax rate');
        }
    };

    const handleBackup = async () => {
        try {
            await window.go.main.App.ExportDatabase();
            toast.success('Backup exported successfully');
        } catch (error) {
            if (error && error.toString().includes('cancelled')) return;
            toast.error('Failed to export backup');
        }
    };

    const handleRestore = async () => {
        try {
            await window.go.main.App.ImportDatabase();
            toast.success('Database restored successfully! Please restart the app.');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            if (error && error.toString().includes('cancelled')) return;
            toast.error('Failed to restore database');
        }
    };

    const handleReset = async () => {
        try {
            await window.go.main.App.ResetDatabase();
            toast.success('All data has been cleared');
        } catch (error) {
            toast.error('Failed to reset database');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Settings className="h-8 w-8 text-primary" />
                    </div>
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">Configure your workspace and manage your data.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Tax Configuration */}
                <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Percent className="h-5 w-5 text-primary" />
                            Tax Configuration
                        </CardTitle>
                        <CardDescription>
                            Set the global tax rate applied to all sales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                    className="max-w-[120px]"
                                />
                                <span className="text-muted-foreground font-medium">%</span>
                            </div>
                        </div>
                        <Button onClick={handleSaveTaxRate} className="gap-2 font-semibold">
                            <Save className="h-4 w-4" />
                            Save Settings
                        </Button>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sun className="h-5 w-5 text-primary" />
                            Appearance
                        </CardTitle>
                        <CardDescription>
                            Choose how Stockly looks on your screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                className="flex-col h-20 gap-2 text-xs"
                                onClick={() => setTheme('light')}
                            >
                                <Sun className="h-5 w-5" />
                                Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                className="flex-col h-20 gap-2 text-xs"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="h-5 w-5" />
                                Dark
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                className="flex-col h-20 gap-2 text-xs"
                                onClick={() => setTheme('system')}
                            >
                                <Monitor className="h-5 w-5" />
                                System
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Database className="h-5 w-5 text-primary" />
                            Data Management
                        </CardTitle>
                        <CardDescription>
                            Backup your records or start fresh.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 pt-2">
                        <Button variant="outline" onClick={handleBackup} className="gap-2">
                            <Download className="h-4 w-4" />
                            Backup Database
                        </Button>

                        <Button variant="outline" onClick={handleRestore} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Restore Backup
                        </Button>

                        <Separator orientation="vertical" className="h-10 hidden sm:block" />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Reset Business Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all products, categories, and sales history. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Reset Everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* About */}
                <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Info className="h-5 w-5 text-primary" />
                            About Stockly
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <p className="font-bold text-xl text-primary">Version 0.0.2</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                Built with ❤️ by
                                <span className="font-bold text-foreground">Raven</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                                <a href="https://github.com/ravvdevv/Stockly" target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4" />
                                    View on GitHub
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
