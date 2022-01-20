import { Knex } from 'knex';

export async function seed(knex: Knex) {
   await knex('rooms').insert([
       { name: 'Sala de Coaching', building: 'Prédio A'},
       { name: 'Sala de Animação 3D', building: 'Prédio B'},
   ]) 
}