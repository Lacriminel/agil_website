import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from '../users/user.entity';
import { Customer } from '../customers/customer.entity';
import { GovernorateGroup } from '../governorates/governorate-group.entity';
import { Governorate } from '../governorates/governorate.entity';
import { Place } from '../places/place.entity';
import { Truck } from '../trucks/truck.entity';
import { Compartment } from '../trucks/compartment.entity';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { UserRole, TruckStatus, OrderStatus, GasType, COMBOS } from '../common/enums';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: +(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'agil_db',
  entities: [User, Customer, GovernorateGroup, Governorate, Place, Truck, Compartment, Order, OrderItem],
  synchronize: true,
  charset: 'utf8mb4',
});

async function seed() {
  await ds.initialize();
  console.log('Connected to DB');

  await ds.query('SET FOREIGN_KEY_CHECKS=0');
  for (const table of ['order_items','orders','compartments','trucks','customers','places','governorates','governorate_groups','users']) {
    await ds.query(`TRUNCATE TABLE ${table}`);
  }
  await ds.query('SET FOREIGN_KEY_CHECKS=1');

  // Admin
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const admin = await ds.getRepository(User).save({
    email: 'admin@agil.tn',
    passwordHash: adminHash,
    role: UserRole.ADMIN,
  });

  // Groups
  const [north, center, south] = await ds.getRepository(GovernorateGroup).save([
    { name: 'Nord' },
    { name: 'Centre' },
    { name: 'Sud' },
  ]);

  // Governorates
  const northGovs = ['Tunis','Ariana','Ben Arous','Manouba','Bizerte','Nabeul','Zaghouan','Beja','Jendouba','Kef'];
  const centerGovs = ['Siliana','Sousse','Monastir','Mahdia','Kairouan','Kasserine','Sidi Bouzid'];
  const southGovs = ['Sfax','Gabes','Medenine','Tataouine','Gafsa','Tozeur','Kebili'];

  const govEntities = await ds.getRepository(Governorate).save([
    ...northGovs.map(name => ({ name, governorateGroupId: north.id })),
    ...centerGovs.map(name => ({ name, governorateGroupId: center.id })),
    ...southGovs.map(name => ({ name, governorateGroupId: south.id })),
  ]);

  const byName = (name: string) => govEntities.find(g => g.name === name)!;

  // Places
  const places = await ds.getRepository(Place).save([
    { name: 'Tunis Centre Station', governorateId: byName('Tunis').id },
    { name: 'Ariana Distribution Hub', governorateId: byName('Ariana').id },
    { name: 'Sousse Fuel Depot', governorateId: byName('Sousse').id },
    { name: 'Sfax Port Terminal', governorateId: byName('Sfax').id },
    { name: 'Gabes Industrial Zone', governorateId: byName('Gabes').id },
  ]);

  // Customers
  const customerPassHash = await bcrypt.hash('Customer123!', 10);

  const user1 = await ds.getRepository(User).save({ email: 'client1@agil.tn', passwordHash: customerPassHash, role: UserRole.CUSTOMER });
  const user2 = await ds.getRepository(User).save({ email: 'client2@agil.tn', passwordHash: customerPassHash, role: UserRole.CUSTOMER });
  const user3 = await ds.getRepository(User).save({ email: 'client3@agil.tn', passwordHash: customerPassHash, role: UserRole.CUSTOMER });

  const c1 = await ds.getRepository(Customer).save({ userId: user1.id, fullName: 'Ahmed Ben Ali', phone: '+216 20 000 001', placeId: places[0].id });
  const c2 = await ds.getRepository(Customer).save({ userId: user2.id, fullName: 'Fatma Trabelsi', phone: '+216 20 000 002', placeId: places[2].id });
  const c3 = await ds.getRepository(Customer).save({ userId: user3.id, fullName: 'Mohamed Sfaxi', phone: '+216 20 000 003', placeId: places[3].id });

  await ds.getRepository(Place).update(places[0].id, { customerId: c1.id });
  await ds.getRepository(Place).update(places[2].id, { customerId: c2.id });
  await ds.getRepository(Place).update(places[3].id, { customerId: c3.id });

  // Trucks (one per combo)
  const comboKeys = ['A','B','C','D','E'];
  const groups = [north, north, center, south, south];
  const truckRepo = ds.getRepository(Truck);
  const compartmentRepo = ds.getRepository(Compartment);

  const trucks: Truck[] = [];
  for (let i = 0; i < comboKeys.length; i++) {
    const key = comboKeys[i];
    const combo = COMBOS[key];
    const total = combo.reduce((a,b) => a+b, 0);
    const truck = await truckRepo.save({
      name: `CAM-${200 + i + 1}`,
      governorateGroupId: groups[i].id,
      status: TruckStatus.AVAILABLE,
      totalCapacity: total,
    });
    const comps = combo.map((cap, pos) => ({
      truckId: truck.id, position: pos+1, capacity: cap, isAvailable: true, gasType: null,
    }));
    await compartmentRepo.save(comps);
    trucks.push(truck);
  }

  // Sample orders
  const truck1Comps = await compartmentRepo.find({ where: { truckId: trucks[0].id } });
  const truck3Comps = await compartmentRepo.find({ where: { truckId: trucks[2].id } });
  const truck4Comps = await compartmentRepo.find({ where: { truckId: trucks[3].id } });

  // Order 1 – DELIVERED (c1, north truck)
  const comp1 = truck1Comps[0];
  const o1 = await ds.getRepository(Order).save({ customerId: c1.id, status: OrderStatus.DELIVERED, totalQuantity: comp1.capacity });
  await ds.getRepository(OrderItem).save({ orderId: o1.id, compartmentId: comp1.id, gasType: GasType.GASOIL, quantity: comp1.capacity });

  // Order 2 – CONFIRMED (c2, center truck)
  const comp3a = truck3Comps[0];
  await compartmentRepo.update(comp3a.id, { isAvailable: false, gasType: GasType.GASOIL_SSP });
  const o2 = await ds.getRepository(Order).save({ customerId: c2.id, status: OrderStatus.CONFIRMED, totalQuantity: comp3a.capacity });
  await ds.getRepository(OrderItem).save({ orderId: o2.id, compartmentId: comp3a.id, gasType: GasType.GASOIL_SSP, quantity: comp3a.capacity });

  // Order 3 – PENDING (c3, south truck)
  const comp4a = truck4Comps[0];
  await compartmentRepo.update(comp4a.id, { isAvailable: false, gasType: GasType.GASOIL_SSF });
  const o3 = await ds.getRepository(Order).save({ customerId: c3.id, status: OrderStatus.PENDING, totalQuantity: comp4a.capacity });
  await ds.getRepository(OrderItem).save({ orderId: o3.id, compartmentId: comp4a.id, gasType: GasType.GASOIL_SSF, quantity: comp4a.capacity });

  console.log('Seed complete!');
  console.log('Admin: admin@agil.tn / Admin123!');
  console.log('Customers: client1@agil.tn, client2@agil.tn, client3@agil.tn / Customer123!');
  await ds.destroy();
}

seed().catch(e => { console.error(e); process.exit(1); });
