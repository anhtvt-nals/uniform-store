import {CartItems} from "@/app/[locale]/cart/cart-items";
import {CartCheckoutContent} from "@/app/[locale]/cart/cart-checkout-content";
import {getRouteLocale} from "@/i18n/server";
import {getActiveCurrencyCode} from "@/lib/currency-server";
import {query} from "@/lib/vendure/api";
import {GetActiveOrderQuery} from "@/lib/vendure/queries";

export async function Cart() {

    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const {data} = await query(GetActiveOrderQuery, {}, {
        useAuthToken: true,
        languageCode: locale,
        currencyCode,
    });

    const activeOrder = data.activeOrder;

    // Handle empty cart case
    if (!activeOrder || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <CartCheckoutContent activeOrder={activeOrder}/>
    )
}
