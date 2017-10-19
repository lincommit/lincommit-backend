'use strict';

describe('The ticketingContractClient service', function() {
  var $httpBackend;
  var ticketingContractClient;

  beforeEach(module('linagora.esn.ticketing'));

  beforeEach(inject(function(_$httpBackend_, _ticketingContractClient_) {
    $httpBackend = _$httpBackend_;
    ticketingContractClient = _ticketingContractClient_;
  }));

  describe('The create function', function() {
    it('should POST to right endpoint to create a new contract', function() {
      var contract = { foo: 'baz' };

      $httpBackend.expectPOST('/ticketing/api/contracts', contract).respond(200, {});

      ticketingContractClient.create(contract);
      $httpBackend.flush();
    });
  });

  describe('The list function', function() {
    it('should get to right endpoint to list contracts', function() {
      var options = {};

      $httpBackend.expectGET('/ticketing/api/contracts').respond(200, []);

      ticketingContractClient.list(options);

      $httpBackend.flush();
    });
  });

  describe('The update function', function() {
    it('should POST to right endpoint to udpate', function() {
      var contractId = '123';
      var updateData = { foo: 'baz' };

      $httpBackend.expectPUT('/ticketing/api/contracts/' + contractId, updateData).respond(200, []);

      ticketingContractClient.update(contractId, updateData);

      $httpBackend.flush();
    });
  });
});
