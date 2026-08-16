import ServiceGrid from "@/components/ServiceGrid";
import { demoServices } from "@/lib/demo-data";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";

export const dynamic = "force-dynamic";

async function getServices() {
  try {
    await connectDB();

    const services = await Service.find()
      .sort({ createdAt: -1 })
      .lean();

    console.log("SERVICES PAGE - MongoDB services:", services.length);
    console.log(
      "SERVICES PAGE - categories:",
      services.map((s) => s.category)
    );

    return services.length ? services : demoServices;
  } catch (error) {
    console.error("SERVICES PAGE - MongoDB error:", error);
    return demoServices;
  }
}

export default async function ServicesPage({ searchParams }) {
  const services = await getServices();

  const params = await searchParams;

  return (
    <main>
      <ServiceGrid
        services={services}
        initialCategory={params?.category || "All"}
        initialQuery={params?.search || ""}
      />
    </main>
  );
}