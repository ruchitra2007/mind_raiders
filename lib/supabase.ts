
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chxqlfmstmefflpzgxmt.supabase.co';
const supabaseKey = 'sb_publishable_MMDHEko-Mz-xl5ncRqckIw_j3GUc667';

export const supabase = createClient(supabaseUrl, supabaseKey);
