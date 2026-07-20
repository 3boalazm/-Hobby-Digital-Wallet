import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

/**
 * Registers only the Chart.js pieces the dashboard's four charts actually
 * use (Line + Bar + Doughnut) rather than the `chart.js/auto` "everything"
 * bundle, to keep the production build smaller. Any file rendering a chart
 * should import from this module (even just for chartColors) so this
 * registration runs before react-chartjs-2 tries to draw anything.
 */
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

/** Matches theme/horizonChakraTheme.ts's brand color + a few complementary accents. */
export const chartColors = {
  balance: '#4318FF',
  income: '#05CD99',
  expense: '#EE5D50',
  categories: ['#4318FF', '#6AD2FF', '#FFB547', '#05CD99', '#EE5D50', '#A3AED0'],
}
