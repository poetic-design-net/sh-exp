import { NextRequest, NextResponse } from "next/server";

async function getAllProducts(wpUrl: string, wcKey: string, wcSecret: string) {
  const allProducts = [];
  let page = 1;
  const perPage = 100; // Maximum allowed by WooCommerce API
  
  while (true) {
    const response = await fetch(
      `${wpUrl}/wp-json/wc/v3/products?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${wcKey}:${wcSecret}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WooCommerce API Fehler: ${response.statusText}`);
    }

    const products = await response.json();
    
    if (products.length === 0) {
      break; // Keine weiteren Produkte
    }

    allProducts.push(...products);
    
    // Prüfe ob es weitere Seiten gibt
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return allProducts;
}

export async function GET(request: NextRequest) {
  try {
    const wpUrl = process.env.WORDPRESS_URL;
    const wcKey = process.env.WC_KEY;
    const wcSecret = process.env.WC_SECRET;

    if (!wpUrl || !wcKey || !wcSecret) {
      throw new Error('Fehlende Umgebungsvariablen');
    }

    // Hole alle Produkte mit Paginierung
    const products = await getAllProducts(wpUrl, wcKey, wcSecret);

    console.log(`Gefundene Produkte: ${products.length}`);

    // Extrahiere relevante Informationen
    const productMappings = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      type: product.type,
      status: product.status,
      price: product.price,
      stripeProductId: product.meta_data?.find((m: any) => m.key === '_stripe_product_id')?.value,
      stripePriceId: product.meta_data?.find((m: any) => m.key === '_stripe_price_id')?.value,
      // Zusätzliche WooCommerce Metadaten
      isSubscription: product.type === 'subscription',
      subscriptionPeriod: product.meta_data?.find((m: any) => m.key === '_subscription_period')?.value,
      subscriptionInterval: product.meta_data?.find((m: any) => m.key === '_subscription_interval')?.value,
    }));

    return NextResponse.json({
      total: products.length,
      products: productMappings,
      message: "Diese Daten können Sie für das membership-mapping.ts verwenden"
    });

  } catch (error: any) {
    console.error("Fehler beim Abrufen der Produkte:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Fehler beim Abrufen der Produkte",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
