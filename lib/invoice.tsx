import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Order } from './types';

// Register fonts for a more professional look
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4TYFqlw.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingBottom: 20,
    },
    logoSection: {
        flexDirection: 'column',
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'black',
        letterSpacing: -1,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: 8,
        color: '#737373',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    invoiceInfo: {
        textAlign: 'right',
    },
    invoiceTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: 8,
        color: '#737373',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    addressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    addressBlock: {
        width: '45%',
    },
    addressTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#737373',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 4,
    },
    addressName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    addressText: {
        lineHeight: 1.4,
        color: '#404040',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    colDescription: { width: '55%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#737373',
    },
    itemName: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemVariants: {
        fontSize: 8,
        color: '#737373',
    },
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 30,
    },
    summaryBlock: {
        width: '40%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#000',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 50,
        right: 50,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 20,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#737373',
        lineHeight: 1.5,
    },
});

export const InvoiceDocument = ({ order }: { order: Order }) => (
    <Document title={`Invoice-${order.orderNumber}`} author="KSWebWear">
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <Text style={styles.brandName}>KSWebWear</Text>
                    <Text style={styles.brandTagline}>Premium Streetwear Collective</Text>
                </View>
                <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                    <Text style={styles.metaLabel}>Order Number</Text>
                    <Text style={styles.metaValue}>{order.orderNumber}</Text>
                    <Text style={styles.metaLabel}>Date of Issue</Text>
                    <Text style={styles.metaValue}>{new Date(order.createdAt).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}</Text>
                </View>
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
                <View style={styles.addressBlock}>
                    <Text style={styles.addressTitle}>Billing To</Text>
                    <Text style={styles.addressName}>{order.shippingAddress.line1}</Text>
                    <Text style={styles.addressText}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</Text>
                    <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
                </View>
                <View style={styles.addressBlock}>
                    <Text style={styles.addressTitle}>Account Info</Text>
                    <Text style={styles.addressText}>Customer Order: {order.orderNumber}</Text>
                    <Text style={styles.addressText}>Payment Method: Stripe Secure Checkout</Text>
                    <Text style={styles.addressText}>Transaction: {order.stripeSessionId.slice(0, 16)}...</Text>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colDescription, styles.headerText]}>Item Description</Text>
                    <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
                    <Text style={[styles.colPrice, styles.headerText]}>Unit Price</Text>
                    <Text style={[styles.colTotal, styles.headerText]}>Total</Text>
                </View>

                {order.items.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <View style={styles.colDescription}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            {(item.size || item.color) && (
                                <Text style={styles.itemVariants}>
                                    {[item.size, item.color].filter(Boolean).join(' / ')}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.colQty}>{item.quantity}</Text>
                        <Text style={styles.colPrice}>${item.price.toFixed(2)}</Text>
                        <Text style={styles.colTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
                <View style={styles.summaryBlock}>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: '#737373' }}>Subtotal</Text>
                        <Text>${order.totalAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: '#737373' }}>Tax (GST Inc.)</Text>
                        <Text>$0.00</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: '#737373' }}>Shipping</Text>
                        <Text>FREE</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)} AUD</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { fontWeight: 'bold', color: '#000', marginBottom: 4 }]}>
                    Thank you for shopping with KSWebWear.
                </Text>
                <Text style={styles.footerText}>
                    If you have any questions regarding this invoice, please contact our support team at admin@kswebwear.com.
                </Text>
            </View>
        </Page>
    </Document>
);
