'use client';

import {useState} from 'react';
import {Eye} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog';

export interface CustomerContract {
    id: string;
    name: string;
    logoUrl: string;
    contractImageUrl: string;
    description: string;
}

export function CustomerContractsClient({contracts}: {contracts: CustomerContract[]}) {
    const [selectedContract, setSelectedContract] = useState<CustomerContract | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {contracts.map((contract) => {
                    const hasContractImage = Boolean(contract.contractImageUrl);

                    return (
                        <div
                            key={contract.id}
                            className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                        >
                            {hasContractImage ? (
                                <button
                                    type="button"
                                    onClick={() => setSelectedContract(contract)}
                                    className="aspect-[3/4] relative w-full bg-muted flex items-center justify-center p-3 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                                    aria-label={`Phóng to ảnh hợp đồng của ${contract.name}`}
                                >
                                    <img
                                        src={contract.contractImageUrl}
                                        alt={contract.name}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <span className="absolute inset-0 bg-foreground/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <Eye className="size-6 text-background" aria-hidden="true" />
                                    </span>
                                    {contract.logoUrl && <ContractLogo contract={contract} />}
                                </button>
                            ) : (
                                <div className="aspect-[3/4] relative bg-muted flex items-center justify-center p-3">
                                    {contract.logoUrl ? (
                                        <img src={contract.logoUrl} alt={contract.name} className="max-w-[80%] max-h-[80%] object-contain grayscale group-hover:grayscale-0 transition-all duration-300" />
                                    ) : (
                                        <span className="text-sm font-semibold text-muted-foreground text-center">{contract.name}</span>
                                    )}
                                </div>
                            )}
                            <div className="p-2.5 text-center">
                                <p className="text-xs font-semibold truncate">{contract.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={Boolean(selectedContract)} onOpenChange={(open) => !open && setSelectedContract(null)}>
                <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden bg-black/95 border-none">
                    <DialogTitle className="sr-only">{selectedContract?.name}</DialogTitle>
                    {selectedContract && (
                        <div className="relative flex items-center justify-center">
                            <img
                                src={selectedContract.contractImageUrl}
                                alt={`Hợp đồng khách hàng ${selectedContract.name}`}
                                className="max-h-[85vh] w-auto max-w-full object-contain"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-5 pb-5 pt-10 text-background">
                                {selectedContract.logoUrl ? (
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background p-1.5 shadow-lg">
                                        <img src={selectedContract.logoUrl} alt="" className="size-full object-contain" />
                                    </span>
                                ) : (
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/20 text-sm font-bold">
                                        {selectedContract.name.slice(0, 1)}
                                    </span>
                                )}
                                <p className="min-w-0 truncate text-sm font-semibold md:text-base">{selectedContract.name}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function ContractLogo({contract}: {contract: CustomerContract}) {
    return (
        <span className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center p-1 shadow-sm">
            <img src={contract.logoUrl} alt="" className="w-full h-full object-contain" />
        </span>
    );
}
