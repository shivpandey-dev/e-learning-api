import 'reflect-metadata';
import { Country } from '../location/entities/country.entity';
import { State } from '../location/entities/state.entity';
import { City } from '../location/entities/city.entity';
import {
  Country as CSCountry,
  State as CSState,
  City as CSCity,
} from 'country-state-city';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV !== 'production', // Disable in production
  logging: process.env.NODE_ENV === 'development',
  entities: [Country, State, City],
});

async function seedLocations() {
  const countryRepo = AppDataSource.getRepository(Country);
  const stateRepo = AppDataSource.getRepository(State);
  const cityRepo = AppDataSource.getRepository(City);

  // Example: Only seed India
  const india = CSCountry.getAllCountries().find((c) => c.isoCode === 'IN');
  if (!india) {
    console.error('India not found in country-state-city data.');
    return;
  }

  let countryEntity = await countryRepo.findOne({
    where: { isoCode: india.isoCode },
  });
  if (!countryEntity) {
    countryEntity = countryRepo.create({
      name: india.name,
      isoCode: india.isoCode,
    });
    await countryRepo.save(countryEntity);
  }

  const states = CSState.getStatesOfCountry(india.isoCode);
  for (const s of states) {
    let stateEntity = await stateRepo.findOne({
      where: { isoCode: s.isoCode, country: { id: countryEntity.id } },
      relations: ['country'],
    });
    if (!stateEntity) {
      stateEntity = stateRepo.create({
        name: s.name,
        isoCode: s.isoCode,
        country: countryEntity,
      });
      await stateRepo.save(stateEntity);
    }

    const cities = CSCity.getCitiesOfState(india.isoCode, s.isoCode);
    for (const c of cities) {
      const existingCity = await cityRepo.findOne({
        where: { name: c.name, state: { id: stateEntity.id } },
        relations: ['state'],
      });
      if (!existingCity) {
        const cityEntity = cityRepo.create({
          name: c.name,
          state: stateEntity,
        });
        await cityRepo.save(cityEntity);
      }
    }
  }

  console.log('✅ Locations seeded successfully!');
}

AppDataSource.initialize()
  .then(async () => {
    await seedLocations();
    await AppDataSource.destroy();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
