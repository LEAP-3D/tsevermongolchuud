import { Clock, Shield, Ban, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-3">
              Today`s usage
            </p>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  E
                </div>
                <span className="text-sm font-medium text-gray-700">Emma</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 ml-8">
                3h 45m
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  O
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Oliver
                </span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 ml-8">
                2h 12m
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span className="text-sm text-green-500 font-medium">
            Healthy usage today
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">
              Safety Score
            </p>
            <p className="text-3xl font-semibold text-gray-900 mb-1">87%</p>
            <span className="text-sm text-green-500 font-medium">
              Excellent
            </span>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">
              Blocked Sites
            </p>
            <p className="text-3xl font-semibold text-gray-900 mb-1">37</p>
            <span className="text-sm text-gray-500">This week</span>
          </div>
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <Ban className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
