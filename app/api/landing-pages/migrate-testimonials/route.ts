import { db } from "@/lib/firebase-admin-server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const snapshot = await db.collection("landing-pages").get();
    const batch = db.batch();
    let updatedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let needsUpdate = false;
      
      // Ensure components is an array
      if (!Array.isArray(data.components)) {
        data.components = [];
        needsUpdate = true;
      }

      // Find or create register component
      let registerComponent = data.components.find((c: any) => c.type === "register");
      if (!registerComponent) {
        registerComponent = {
          id: `register-${Date.now()}`,
          type: "register",
          props: {},
          order: data.components.length
        };
        data.components.push(registerComponent);
        needsUpdate = true;
      }

      // Ensure register component has props
      if (!registerComponent.props) {
        registerComponent.props = {};
        needsUpdate = true;
      }

      // Ensure event structure exists
      if (!registerComponent.props.event) {
        registerComponent.props.event = {
          title: "",
          description: "",
          buttonText: "",
          buttonLink: ""
        };
        needsUpdate = true;
      }

      // Ensure testimonials structure exists with items array
      if (!registerComponent.props.testimonials || !Array.isArray(registerComponent.props.testimonials.items)) {
        registerComponent.props.testimonials = {
          title: registerComponent.props.testimonials?.title || "",
          items: [
            { name: "", quote: "", image: "" },
            { name: "", quote: "", image: "" },
            { name: "", quote: "", image: "" }
          ]
        };
        needsUpdate = true;
      }

      // Ensure waiting list structure exists
      if (!registerComponent.props.waitingList) {
        registerComponent.props.waitingList = {
          title: "",
          description: "",
          buttonText: "",
          checkboxes: []
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        batch.update(doc.ref, { components: data.components });
        updatedCount++;
      }
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Successfully migrated testimonials structure for ${updatedCount} landing pages` 
    });
  } catch (error) {
    console.error("Error migrating testimonials:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate testimonials" },
      { status: 500 }
    );
  }
}
