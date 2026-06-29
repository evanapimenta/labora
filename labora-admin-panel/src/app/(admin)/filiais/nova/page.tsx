import NovaFilialClient from './NovaFilialClient';
import { getLaboratories } from '@/actions/laboratory';

export default async function NovaFilialPage() {
  const labs = await getLaboratories();
  return <NovaFilialClient labs={labs} />;
}
