(function(angular) {
  angular.module('linagora.esn.ticketing')
    .controller('TicketingContractListController', TicketingContractListController);

  function TicketingContractListController(
    $state,
    $scope,
    infiniteScrollHelper,
    ticketingContractClient,
    TICKETING_CONTRACT_EVENTS
  ) {
    var self = this;
    var DEFAULT_LIMIT = 20;
    var options = {
      offset: 0,
      limit: DEFAULT_LIMIT
    };

    self.$onInit = $onInit;

    function $onInit() {
      if (self.organization) {
        options.organization = self.organization._id;
      }

      self.onItemClick = onItemClick;
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);

      $scope.$on(TICKETING_CONTRACT_EVENTS.CONTRACT_CREATED, function(event, organization) {
        _onContractCreated(organization);
      });
    }

    function _loadNextItems() {
      options.offset = self.elements.length;

      return ticketingContractClient.list(options)
        .then(function(response) {
          return response.data;
        });
    }

    function onItemClick(contractId) {
      $state.go('ticketingAdminCenter.contract.detail', { contractId: contractId });
    }

    function _onContractCreated(contract) {
      if (!contract) {
        return;
      }

      self.elements.unshift(contract);
    }
  }
})(angular);