const mongoose = require('mongoose');
const Quotation = require('./models/quotation.model');
const Vendor = require('./models/vendor.model');
const dayjs = require('dayjs');

mongoose.connect('mongodb://localhost:27017/your_database', { useNewUrlParser: true, useUnifiedTopology: true });

const updateVendorCategories = async () => {
  try {
    const quotations = await Quotation.find({ isFinalized: true });
    const vendors = await Vendor.find();
    const vendorMap = new Map(vendors.map((v) => [v.id, v.category]));

    let updatedCount = 0;
    for (const quotation of quotations) {
      let updated = false;
      quotation.packages.forEach((pkg) => {
        pkg.services.forEach((service) => {
          if (service.vendorId && (!service.vendorCategory || !service.assignedDate)) {
            if (vendorMap.has(service.vendorId)) {
              service.vendorCategory = vendorMap.get(service.vendorId);
              service.assignedDate = quotation.updatedAt
                ? dayjs(quotation.updatedAt).format('DD/MM/YYYY')
                : dayjs().format('DD/MM/YYYY');
              updated = true;
            } else {
              console.warn(`No vendor found for vendorId: ${service.vendorId} in service: ${service.serviceName}`);
            }
          }
        });
      });
      if (updated) {
        quotation.updatedAt = Date.now();
        await quotation.save();
        updatedCount++;
        console.log(`Updated quotation ${quotation.id}:`, JSON.stringify(quotation.packages[0].services, null, 2));
      }
    }
    console.log(`Updated ${updatedCount} quotations with vendor categories and assigned dates`);
  } catch (error) {
    console.error('Error in migration:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

updateVendorCategories();