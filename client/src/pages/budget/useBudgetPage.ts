import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTripStore } from '../../store/tripStore'
import { tripsApi } from '../../api/client'
import { getApiErrorMessage } from '../../utils/apiError'
import type { TripMember } from '../../components/Budget/BudgetPanelMemberChips'

interface MembersResponse {
  owner: TripMember
  members: TripMember[]
}

/**
 * Hook for BudgetPage. components/Budget/BudgetPanel.tsx (via useBudgetPanel.ts)
 * already owns all real budget logic — items, categories, settlement, CSV
 * export — and reads the trip from the global tripStore. This hook only
 * does the two things a fresh route needs that TripPlannerPage would
 * otherwise have already done: hydrate that trip into the store, and fetch
 * the member roster the same way TripPlannerPage's refreshMembers() does.
 *
 * loadTrip() hydrates every trip-scoped slice (days, places, packing, todo,
 * budget, reservations, files) — more than Budget alone needs — but it's the
 * one existing, tested way to populate tripStore.trip, and duplicating a
 * narrower version of it isn't worth it for the extra requests it avoids.
 * Unlike TripPlannerPage, there's no offline-cache branch here — none of the
 * other Horizon pages (Wallet, Dashboard, Reports) have one either yet.
 */
export function useBudgetPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const tripActions = useRef(useTripStore.getState()).current
  const [tripMembers, setTripMembers] = useState<TripMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripId) return
    setIsLoading(true)
    Promise.all([
      tripActions.loadTrip(tripId),
      tripsApi.getMembers(tripId).then((d: MembersResponse) => {
        setTripMembers([d.owner, ...(d.members || [])].filter(Boolean))
      }),
    ])
      .then(() => setError(null))
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load the budget.')))
      .finally(() => setIsLoading(false))
  }, [tripId])

  return { tripId, tripMembers, isLoading, error }
}
