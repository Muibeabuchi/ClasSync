import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Link, Users, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface JoinRequestsLinkingPageProps {
  onBack: () => void;
}

const JoinRequestsLinkingPage = ({ onBack }: JoinRequestsLinkingPageProps) => {
  const [linkedPairs, setLinkedPairs] = useState<Set<string>>(new Set());

  // Mock unlinked student requests
  const mockUnlinkedRequests = [
    {
      id: 'req1',
      name: 'John Smith',
      regNumber: 'CS/2024/007',
      email: 'john.smith@student.futo.edu.ng',
      department: 'Computer Science',
      requestDate: '2024-01-20',
    },
    {
      id: 'req2',
      name: 'Sarah Johnson',
      regNumber: 'CS/2024/008',
      email: 'sarah.johnson@student.futo.edu.ng',
      department: 'Software Engineering',
      requestDate: '2024-01-21',
    },
    {
      id: 'req3',
      name: 'Mike Davis',
      regNumber: 'CS/2024/009',
      email: 'mike.davis@student.futo.edu.ng',
      department: 'Computer Science',
      requestDate: '2024-01-22',
    },
  ];

  // Mock unlinked CSV entries
  const mockUnlinkedCsvEntries = [
    {
      id: 'csv1',
      name: 'John Smith',
      regNumber: 'CS/2024/007',
      email: 'j.smith@gmail.com',
      gender: 'Male',
      department: 'Computer Science',
    },
    {
      id: 'csv2',
      name: 'Sarah Johnson',
      regNumber: 'CS/2024/008',
      email: 'sarah.j@yahoo.com',
      gender: 'Female',
      department: 'Software Engineering',
    },
    {
      id: 'csv3',
      name: 'Michael Davis',
      regNumber: 'CS/2024/009',
      email: 'mdavis@hotmail.com',
      gender: 'Male',
      department: 'Computer Science',
    },
  ];

  const handleLinkStudents = (requestId: string, csvId: string) => {
    const pairKey = `${requestId}-${csvId}`;
    setLinkedPairs((prev) => new Set([...prev, pairKey]));

    toast.success(
      'Students Linked Successfully The student request has been matched with the CSV entry.',
    );
  };

  const isLinked = (requestId: string, csvId: string) => {
    return linkedPairs.has(`${requestId}-${csvId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="hover:scale-110 transition-transform"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Link Student Requests
          </h1>
          <p className="text-gray-600">
            Match student join requests with CSV attendance entries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unlinked Student Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Join Requests
            </CardTitle>
            <CardDescription>
              Students who requested to join the course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUnlinkedRequests.map((request) => {
                const hasLinkedEntry = Array.from(linkedPairs).some((pair) =>
                  pair.startsWith(request.id),
                );
                return (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg transition-all ${
                      hasLinkedEntry
                        ? 'bg-green-50 border-green-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{request.name}</h4>
                          {hasLinkedEntry && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {request.regNumber}
                        </p>
                        <p className="text-sm text-gray-600">{request.email}</p>
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {request.requestDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Unlinked CSV Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              CSV Attendance Entries
            </CardTitle>
            <CardDescription>
              Student records from uploaded attendance CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUnlinkedCsvEntries.map((csvEntry) => {
                const hasLinkedRequest = Array.from(linkedPairs).some((pair) =>
                  pair.endsWith(csvEntry.id),
                );
                return (
                  <div
                    key={csvEntry.id}
                    className={`p-4 border rounded-lg transition-all ${
                      hasLinkedRequest
                        ? 'bg-green-50 border-green-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{csvEntry.name}</h4>
                        {hasLinkedRequest && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {csvEntry.regNumber}
                      </p>
                      <p className="text-sm text-gray-600">{csvEntry.email}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{csvEntry.department}</Badge>
                        <Badge variant="secondary">{csvEntry.gender}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linking Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-green-600" />
            Link Students
          </CardTitle>
          <CardDescription>
            Click to match a student request with a CSV entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockUnlinkedRequests.map((request) =>
              mockUnlinkedCsvEntries
                .filter(
                  (csv) =>
                    csv.name
                      .toLowerCase()
                      .includes(request.name.toLowerCase()) ||
                    csv.regNumber === request.regNumber,
                )
                .map((matchingCsv) => (
                  <div
                    key={`${request.id}-${matchingCsv.id}`}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="text-center space-y-3">
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">
                          {request.name}
                        </p>
                        <p className="text-blue-700">↓ matches ↓</p>
                        <p className="font-medium text-blue-900">
                          {matchingCsv.name}
                        </p>
                      </div>

                      {isLinked(request.id, matchingCsv.id) ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Linked</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleLinkStudents(request.id, matchingCsv.id)
                          }
                          className="hover:scale-105 transition-transform"
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Link
                        </Button>
                      )}
                    </div>
                  </div>
                )),
            )}
          </div>

          {linkedPairs.size === 0 && (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No potential matches found. Students will be linked
                automatically when names or registration numbers match.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {linkedPairs.size > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {linkedPairs.size} student(s) successfully linked
                </span>
              </div>
              <Button variant="outline" className="bg-white">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JoinRequestsLinkingPage;
